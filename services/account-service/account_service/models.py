from django.db import models


class Profile(models.Model):
    user_id = models.IntegerField(db_column="User_Id", db_index=True)
    full_name = models.CharField(max_length=510)
    phone = models.CharField(max_length=40, null=True, blank=True)
    avatar_url = models.CharField(max_length=400, null=True, blank=True, db_column="AvatarUrl")
    created_at = models.DateTimeField(null=True, blank=True, auto_now_add=True, db_column="Created_At")

    class Meta:
        db_table = "Profiles"


class Agence(models.Model):
    user_id = models.IntegerField(db_column="User_Id", db_index=True)
    company_name = models.CharField(max_length=510, db_column="Company_Name")
    owner_name = models.CharField(max_length=510, db_column="OwnerName")
    commune_id = models.IntegerField(db_column="Commune_Id", db_index=True)
    registration_number = models.CharField(max_length=510, db_column="RegistrationNumber")
    logo_url = models.CharField(max_length=400, null=True, blank=True, db_column="LogoUrl")
    description = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "Agences"


class Promoteur(models.Model):
    user_id = models.IntegerField(db_column="User_Id", db_index=True)
    company_name = models.CharField(max_length=510, db_column="Company_Name")
    owner_name = models.CharField(max_length=510, db_column="OwnerName")
    registration_number = models.CharField(max_length=510, db_column="RegistrationNumber")
    commune_id = models.IntegerField(db_column="Commune_Id", db_index=True)
    logo_url = models.CharField(max_length=510, null=True, blank=True, db_column="LogoUrl")
    description = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "Promoteurs"
