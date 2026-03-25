from django.db import models


class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = "Roles"


class User(models.Model):
    name = models.CharField(max_length=510)
    email = models.EmailField(max_length=510, unique=True)
    password_hash = models.CharField(max_length=510)
    phone = models.CharField(max_length=40)
    role = models.ForeignKey(Role, on_delete=models.PROTECT, db_column="Role_Id")
    created_at = models.DateTimeField(null=True, blank=True, auto_now_add=True, db_column="Created_At")
    is_active = models.BooleanField(default=True, db_column="IsActive")

    class Meta:
        db_table = "Users"


class RefreshToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column="User_Id")
    token = models.CharField(max_length=500)
    expires_at = models.DateTimeField(db_column="Expires_At")
    created_at = models.DateTimeField(auto_now_add=True, db_column="Created_At")
    revoked_at = models.DateTimeField(null=True, blank=True, db_column="Revoked_At")

    class Meta:
        db_table = "RefreshTokens"
