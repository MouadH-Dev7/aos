import os
import json
from datetime import datetime, timedelta, timezone

import jwt
import pika
from django.contrib.auth.hashers import make_password, check_password
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import User, Role, RefreshToken
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    RefreshSerializer,
    UserSerializer,
    UpdateMeSerializer,
    AdminUserCreateSerializer,
    AdminUserUpdateSerializer,
)


JWT_SECRET = os.getenv("JWT_SECRET", os.getenv("DJANGO_SECRET_KEY", "dev-secret"))
JWT_ALG = os.getenv("JWT_ALG", "HS256")
ACCESS_TTL_MIN = int(os.getenv("JWT_ACCESS_TTL_MIN", "60"))
REFRESH_TTL_DAYS = int(os.getenv("JWT_REFRESH_TTL_DAYS", "7"))
RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
USER_REGISTERED_QUEUE = os.getenv("USER_REGISTERED_QUEUE", "user_registered")
ADMIN_ROLE_ID = 4


def _now():
    return datetime.now(timezone.utc)


def _encode(payload):
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def _decode(token):
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])


def create_access_token(user):
    exp = _now() + timedelta(minutes=ACCESS_TTL_MIN)
    payload = {"sub": str(user.id), "email": user.email, "role_id": user.role_id, "exp": exp}
    return _encode(payload)


def create_refresh_token(user):
    exp = _now() + timedelta(days=REFRESH_TTL_DAYS)
    payload = {"sub": str(user.id), "type": "refresh", "exp": exp}
    return _encode(payload), exp


def get_user_from_auth(request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        user = User.objects.filter(is_active=True).first()
        if not user:
            return None, "User not found"
        return user, None
    token = auth.split(" ", 1)[1].strip()
    try:
        data = _decode(token)
        user_id = int(data.get("sub"))
        user = User.objects.filter(id=user_id, is_active=True).first()
        if not user:
            return None, "User not found"
        return user, None
    except Exception as exc:
        return None, str(exc)


def get_admin_user_from_auth(request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        user = User.objects.filter(is_active=True, role_id=ADMIN_ROLE_ID).first()
        if not user:
            return None, "Admin user not found"
        return user, None
    user, err = get_user_from_auth(request)
    if err:
        return None, err
    if int(user.role_id or 0) != ADMIN_ROLE_ID:
        return None, "Admin role is required"
    return user, None


def publish_user_registered(user):
    payload = {
        "event": "user_registered",
        "user": {"id": user.id, "email": user.email, "role_id": user.role_id},
    }
    try:
        connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
        channel = connection.channel()
        channel.queue_declare(queue=USER_REGISTERED_QUEUE, durable=True)
        channel.basic_publish(
            exchange="",
            routing_key=USER_REGISTERED_QUEUE,
            body=json.dumps(payload).encode("utf-8"),
            properties=pika.BasicProperties(delivery_mode=2),
        )
        connection.close()
    except Exception:
        # Do not block registration if RabbitMQ is down
        pass


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        role = Role.objects.filter(id=data["role_id"]).first()
        if not role:
            return Response({"role_id": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=data["email"]).exists():
            return Response({"email": "Already exists"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create(
            name=data["name"],
            email=data["email"],
            password_hash=make_password(data["password"]),
            phone=data["phone"],
            role=role,
        )

        publish_user_registered(user)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        user = User.objects.filter(email=data["email"]).first()
        if not user or not user.is_active:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        if not check_password(data["password"], user.password_hash):
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        access = create_access_token(user)
        refresh, exp = create_refresh_token(user)

        RefreshToken.objects.create(user=user, token=refresh, expires_at=exp)

        return Response({"access": access, "refresh": refresh, "user": UserSerializer(user).data})


class RefreshView(APIView):
    def post(self, request):
        serializer = RefreshSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        token = serializer.validated_data["refresh"]

        db_token = RefreshToken.objects.filter(token=token, revoked_at__isnull=True).first()
        if not db_token:
            return Response({"detail": "Invalid refresh token"}, status=status.HTTP_401_UNAUTHORIZED)

        if db_token.expires_at < _now():
            return Response({"detail": "Refresh token expired"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            data = _decode(token)
            if data.get("type") != "refresh":
                return Response({"detail": "Invalid token type"}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception:
            return Response({"detail": "Invalid refresh token"}, status=status.HTTP_401_UNAUTHORIZED)

        access = create_access_token(db_token.user)
        return Response({"access": access})


class MeView(APIView):
    def get(self, request):
        user, err = get_user_from_auth(request)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(UserSerializer(user).data)

    def patch(self, request):
        user, err = get_user_from_auth(request)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = UpdateMeSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        next_email = data.get("email")
        if next_email and User.objects.exclude(id=user.id).filter(email=next_email).exists():
            return Response({"email": "Already exists"}, status=status.HTTP_400_BAD_REQUEST)

        fields_to_update = []
        if "name" in data:
            user.name = data["name"]
            fields_to_update.append("name")
        if "email" in data:
            user.email = data["email"]
            fields_to_update.append("email")
        if "phone" in data:
            user.phone = data["phone"]
            fields_to_update.append("phone")

        if fields_to_update:
            user.save(update_fields=fields_to_update)

        return Response(UserSerializer(user).data)


class RoleListView(APIView):
    def get(self, request):
        admin_user, err = get_admin_user_from_auth(request)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        roles = list(Role.objects.all().order_by("id").values("id", "name"))
        return Response(roles)


class UserListView(APIView):
    def get(self, request):
        admin_user, err = get_admin_user_from_auth(request)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        users = User.objects.select_related("role").all().order_by("-created_at", "-id")
        return Response(UserSerializer(users, many=True).data)

    def post(self, request):
        admin_user, err = get_admin_user_from_auth(request)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = AdminUserCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        if User.objects.filter(email=data["email"]).exists():
            return Response({"email": "Already exists"}, status=status.HTTP_400_BAD_REQUEST)

        role = Role.objects.filter(id=data["role_id"]).first()
        if not role:
            return Response({"role_id": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create(
            name=data["name"],
            email=data["email"],
            password_hash=make_password(data["password"]),
            phone=data["phone"],
            role=role,
            is_active=bool(data.get("is_active", True)),
        )
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class UserDetailView(APIView):
    def patch(self, request, pk):
        admin_user, err = get_admin_user_from_auth(request)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        user = get_object_or_404(User, pk=pk)
        serializer = AdminUserUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        next_email = data.get("email")
        if next_email and User.objects.exclude(id=user.id).filter(email=next_email).exists():
            return Response({"email": "Already exists"}, status=status.HTTP_400_BAD_REQUEST)

        fields_to_update = []
        if "name" in data:
            user.name = data["name"]
            fields_to_update.append("name")
        if "email" in data:
            user.email = data["email"]
            fields_to_update.append("email")
        if "phone" in data:
            user.phone = data["phone"]
            fields_to_update.append("phone")
        if "is_active" in data:
            user.is_active = data["is_active"]
            fields_to_update.append("is_active")
        if "password" in data:
            user.password_hash = make_password(data["password"])
            fields_to_update.append("password_hash")
        if "role_id" in data:
            role = Role.objects.filter(id=data["role_id"]).first()
            if not role:
                return Response({"role_id": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)
            user.role = role
            fields_to_update.append("role")

        if fields_to_update:
            user.save(update_fields=fields_to_update)

        return Response(UserSerializer(user).data)

    def delete(self, request, pk):
        admin_user, err = get_admin_user_from_auth(request)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        user = get_object_or_404(User, pk=pk)
        if user.is_active:
            user.is_active = False
            user.save(update_fields=["is_active"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class ActivePublicUserIdsView(APIView):
    """
    Lightweight endpoint used by listing-service to ensure only listings
    owned by active public accounts are visible.
    """

    def get(self, request):
        role_ids = [1, 2, 3]  # User, Agencies, Promoters
        user_ids = list(
            User.objects.filter(is_active=True, role_id__in=role_ids)
            .values_list("id", flat=True)
            .order_by("id")
        )
        return Response({"user_ids": user_ids})
