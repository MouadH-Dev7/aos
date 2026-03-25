from rest_framework import serializers
import cloudinary.uploader
from .models import Profile, Agence, Promoteur


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["id", "user_id", "full_name", "phone", "avatar_url", "created_at"]
        read_only_fields = ["id", "created_at"]


class AgenceSerializer(serializers.ModelSerializer):
    logo_file = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = Agence
        fields = [
            "id",
            "user_id",
            "company_name",
            "owner_name",
            "commune_id",
            "registration_number",
            "logo_url",
            "logo_file",
            "description",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        logo_file = validated_data.pop("logo_file", None)
        if logo_file:
            try:
                upload_result = cloudinary.uploader.upload(
                    logo_file,
                    folder="immoalgeria/accounts",
                )
                validated_data["logo_url"] = (
                    upload_result.get("secure_url") or upload_result.get("url") or ""
                )
            except Exception as exc:
                raise serializers.ValidationError(
                    {"logo_file": f"Logo upload failed: {exc}"}
                ) from exc
        return super().create(validated_data)

    def update(self, instance, validated_data):
        logo_file = validated_data.pop("logo_file", None)
        if logo_file:
            try:
                upload_result = cloudinary.uploader.upload(
                    logo_file,
                    folder="immoalgeria/accounts",
                )
                validated_data["logo_url"] = (
                    upload_result.get("secure_url") or upload_result.get("url") or ""
                )
            except Exception as exc:
                raise serializers.ValidationError(
                    {"logo_file": f"Logo upload failed: {exc}"}
                ) from exc
        return super().update(instance, validated_data)


class PromoteurSerializer(serializers.ModelSerializer):
    logo_file = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = Promoteur
        fields = [
            "id",
            "user_id",
            "company_name",
            "owner_name",
            "registration_number",
            "commune_id",
            "logo_url",
            "logo_file",
            "description",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        logo_file = validated_data.pop("logo_file", None)
        if logo_file:
            try:
                upload_result = cloudinary.uploader.upload(
                    logo_file,
                    folder="immoalgeria/accounts",
                )
                validated_data["logo_url"] = (
                    upload_result.get("secure_url") or upload_result.get("url") or ""
                )
            except Exception as exc:
                raise serializers.ValidationError(
                    {"logo_file": f"Logo upload failed: {exc}"}
                ) from exc
        return super().create(validated_data)

    def update(self, instance, validated_data):
        logo_file = validated_data.pop("logo_file", None)
        if logo_file:
            try:
                upload_result = cloudinary.uploader.upload(
                    logo_file,
                    folder="immoalgeria/accounts",
                )
                validated_data["logo_url"] = (
                    upload_result.get("secure_url") or upload_result.get("url") or ""
                )
            except Exception as exc:
                raise serializers.ValidationError(
                    {"logo_file": f"Logo upload failed: {exc}"}
                ) from exc
        return super().update(instance, validated_data)
