from rest_framework import serializers
from .models import User


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=510)
    email = serializers.EmailField(max_length=510)
    password = serializers.CharField(min_length=6, max_length=128, write_only=True)
    phone = serializers.CharField(max_length=40)
    role_id = serializers.IntegerField()


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=510)
    password = serializers.CharField(write_only=True)


class RefreshSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class UserSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source="role.name", read_only=True)

    class Meta:
        model = User
        fields = ["id", "name", "email", "phone", "role_id", "role_name", "created_at", "is_active"]


class UpdateMeSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=510, required=False)
    email = serializers.EmailField(max_length=510, required=False)
    phone = serializers.CharField(max_length=40, required=False)


class AdminUserCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=510)
    email = serializers.EmailField(max_length=510)
    password = serializers.CharField(min_length=6, max_length=128, write_only=True)
    phone = serializers.CharField(max_length=40)
    role_id = serializers.IntegerField()
    is_active = serializers.BooleanField(required=False, default=True)


class AdminUserUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=510, required=False)
    email = serializers.EmailField(max_length=510, required=False)
    phone = serializers.CharField(max_length=40, required=False)
    role_id = serializers.IntegerField(required=False)
    password = serializers.CharField(min_length=6, max_length=128, write_only=True, required=False)
    is_active = serializers.BooleanField(required=False)
