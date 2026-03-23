import os
import jwt
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.exceptions import NotAuthenticated, PermissionDenied

from .models import Profile, Agence, Promoteur
from .serializers import ProfileSerializer, AgenceSerializer, PromoteurSerializer

JWT_SECRET = os.getenv("JWT_SECRET", os.getenv("DJANGO_SECRET_KEY", "dev-secret"))
JWT_ALG = os.getenv("JWT_ALG", "HS256")
ADMIN_ROLE_ID = int(os.getenv("ADMIN_ROLE_ID", "4"))


def _auth_payload(request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None, "Missing Bearer token"
    token = auth.split(" ", 1)[1].strip()
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        return payload, None
    except Exception as exc:
        return None, str(exc)


def _require_owner_or_admin(request, owner_user_id):
    payload, err = _auth_payload(request)
    if err:
        raise NotAuthenticated(err)
    role_id = int(payload.get("role_id") or 0)
    user_id = payload.get("sub") or payload.get("user_id")
    if role_id == ADMIN_ROLE_ID:
        return
    if str(user_id) != str(owner_user_id):
        raise PermissionDenied("You do not have permission to modify this record.")


class ProfileListCreateView(generics.ListCreateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        user_id = self.request.query_params.get("user_id", "").strip()
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset

    def perform_create(self, serializer):
        user_id = serializer.validated_data.get("user_id")
        if user_id is None:
            raise NotAuthenticated("User id is required.")
        _require_owner_or_admin(self.request, user_id)
        serializer.save()


class AgenceListCreateView(generics.ListCreateAPIView):
    queryset = Agence.objects.all().order_by("-id")
    serializer_class = AgenceSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get("search", "").strip()
        commune_id = self.request.query_params.get("commune_id", "").strip()
        user_id = self.request.query_params.get("user_id", "").strip()
        if search:
            queryset = queryset.filter(
                Q(company_name__icontains=search)
                | Q(owner_name__icontains=search)
                | Q(description__icontains=search)
            )
        if commune_id:
            queryset = queryset.filter(commune_id=commune_id)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset

    def perform_create(self, serializer):
        user_id = serializer.validated_data.get("user_id")
        if user_id is None:
            raise NotAuthenticated("User id is required.")
        _require_owner_or_admin(self.request, user_id)
        serializer.save()


class PromoteurListCreateView(generics.ListCreateAPIView):
    queryset = Promoteur.objects.all().order_by("-id")
    serializer_class = PromoteurSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get("search", "").strip()
        commune_id = self.request.query_params.get("commune_id", "").strip()
        user_id = self.request.query_params.get("user_id", "").strip()
        if search:
            queryset = queryset.filter(
                Q(company_name__icontains=search)
                | Q(owner_name__icontains=search)
                | Q(description__icontains=search)
            )
        if commune_id:
            queryset = queryset.filter(commune_id=commune_id)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset

    def perform_create(self, serializer):
        user_id = serializer.validated_data.get("user_id")
        if user_id is None:
            raise NotAuthenticated("User id is required.")
        _require_owner_or_admin(self.request, user_id)
        serializer.save()


class AgenceDetailView(generics.RetrieveUpdateAPIView):
    queryset = Agence.objects.all()
    serializer_class = AgenceSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        _require_owner_or_admin(request, instance.user_id)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        _require_owner_or_admin(request, instance.user_id)
        return super().partial_update(request, *args, **kwargs)


class PromoteurDetailView(generics.RetrieveUpdateAPIView):
    queryset = Promoteur.objects.all()
    serializer_class = PromoteurSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        _require_owner_or_admin(request, instance.user_id)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        _require_owner_or_admin(request, instance.user_id)
        return super().partial_update(request, *args, **kwargs)


class ProfileByUserView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer

    def get_object(self):
        user_id = self.kwargs["user_id"]
        _require_owner_or_admin(self.request, user_id)
        return get_object_or_404(Profile, user_id=user_id)


class AgenceByUserView(generics.RetrieveUpdateAPIView):
    serializer_class = AgenceSerializer

    def get_object(self):
        user_id = self.kwargs["user_id"]
        _require_owner_or_admin(self.request, user_id)
        return get_object_or_404(Agence, user_id=user_id)


class PromoteurByUserView(generics.RetrieveUpdateAPIView):
    serializer_class = PromoteurSerializer

    def get_object(self):
        user_id = self.kwargs["user_id"]
        _require_owner_or_admin(self.request, user_id)
        return get_object_or_404(Promoteur, user_id=user_id)
