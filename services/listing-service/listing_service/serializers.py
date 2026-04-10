from rest_framework import serializers
import cloudinary.uploader

from listing_service.models import (
    Category,
    Type,
    StatusProperty,
    Property,
    PropertyImage,
    Amenity,
    PropertyDocument,
    DocumentType,
    ContactType,
    PropertyContact,
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name")


class TypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Type
        fields = ("id", "name")


class StatusPropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = StatusProperty
        fields = ("id", "name")


class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ("id", "name")


class DocumentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentType
        fields = ("id", "name")


class ContactTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactType
        fields = ("id", "name")


class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ("id", "image_url", "image_file", "position")


class PropertyDocumentSerializer(serializers.ModelSerializer):
    document_type_name = serializers.CharField(source="document_type.name", read_only=True)

    class Meta:
        model = PropertyDocument
        fields = ("id", "document_type", "document_type_name", "name", "uploaded_at")


class PropertyContactSerializer(serializers.ModelSerializer):
    contact_type_name = serializers.CharField(source="contact_type.name", read_only=True)

    class Meta:
        model = PropertyContact
        fields = ("id", "contact_type", "contact_type_name", "value", "is_primary", "created_at")


class PropertyCreateSerializer(serializers.ModelSerializer):
    image_urls = serializers.CharField(write_only=True, required=False, allow_blank=True)
    image_files = serializers.ListField(child=serializers.ImageField(), write_only=True, required=False)
    amenity_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)

    class Meta:
        model = Property
        fields = (
            "id",
            "user_id",
            "commune_id",
            "category",
            "type",
            "title",
            "description",
            "price",
            "area",
            "bedrooms",
            "bathrooms",
            "latitude",
            "longitude",
            "amenity_ids",
            "image_urls",
            "image_files",
        )

    def create(self, validated_data):
        raw_urls = validated_data.pop("image_urls", "")
        amenity_ids = validated_data.pop("amenity_ids", None)
        request = self.context.get("request")
        image_files = []
        if request is not None:
            image_files = request.FILES.getlist("image_files")
        if not image_files:
            image_files = validated_data.pop("image_files", [])
        else:
            validated_data.pop("image_files", None)

        image_urls = [url.strip() for url in raw_urls.replace(",", "\n").splitlines() if url.strip()]
        status, _ = StatusProperty.objects.get_or_create(name="Pending")
        property_obj = Property.objects.create(status=status, **validated_data)
        if amenity_ids is not None:
            property_obj.amenities.set(Amenity.objects.filter(id__in=amenity_ids))

        url_images = [PropertyImage(property=property_obj, image_url=url, position=index + 1) for index, url in enumerate(image_urls)]
        if url_images:
            PropertyImage.objects.bulk_create(url_images)

        for index, image_file in enumerate(image_files, start=len(url_images) + 1):
            upload_result = cloudinary.uploader.upload(image_file, folder="immoalgeria/properties")
            PropertyImage.objects.create(
                property=property_obj,
                image_url=upload_result.get("secure_url") or upload_result.get("url") or "",
                position=index,
            )
        return property_obj


class PropertyListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    type_name = serializers.CharField(source="type.name", read_only=True)
    status_name = serializers.CharField(source="status.name", read_only=True)
    images = PropertyImageSerializer(source="propertyimage_set", many=True, read_only=True)
    documents = PropertyDocumentSerializer(source="propertydocument_set", many=True, read_only=True)
    main_image_url = serializers.SerializerMethodField()
    amenities = AmenitySerializer(many=True, read_only=True)
    contacts = PropertyContactSerializer(source="propertycontact_set", many=True, read_only=True)

    class Meta:
        model = Property
        fields = (
            "id",
            "user_id",
            "commune_id",
            "category",
            "category_name",
            "type",
            "type_name",
            "title",
            "description",
            "price",
            "area",
            "bedrooms",
            "bathrooms",
            "latitude",
            "longitude",
            "created_at",
            "status",
            "status_name",
            "amenities",
            "images",
            "documents",
            "contacts",
            "main_image_url",
        )

    def get_main_image_url(self, obj):
        first = obj.propertyimage_set.order_by("position", "id").first()
        return first.image_url if first else ""


class PropertyUpdateSerializer(serializers.ModelSerializer):
    image_urls = serializers.CharField(write_only=True, required=False, allow_blank=True)
    image_files = serializers.ListField(child=serializers.ImageField(), write_only=True, required=False)
    amenity_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)

    class Meta:
        model = Property
        fields = (
            "commune_id",
            "category",
            "type",
            "title",
            "description",
            "price",
            "area",
            "bedrooms",
            "bathrooms",
            "latitude",
            "longitude",
            "status",
            "amenity_ids",
            "image_urls",
            "image_files",
        )

    def update(self, instance, validated_data):
        raw_urls = validated_data.pop("image_urls", "")
        amenity_ids = validated_data.pop("amenity_ids", None)
        request = self.context.get("request")
        image_files = []
        if request is not None:
            image_files = request.FILES.getlist("image_files")
        if not image_files:
            image_files = validated_data.pop("image_files", [])
        else:
            validated_data.pop("image_files", None)

        instance = super().update(instance, validated_data)
        if amenity_ids is not None:
            instance.amenities.set(Amenity.objects.filter(id__in=amenity_ids))

        image_urls = [url.strip() for url in raw_urls.replace(",", "\n").splitlines() if url.strip()]
        if image_urls or image_files:
            last_image = instance.propertyimage_set.order_by("-position", "-id").first()
            next_position = (last_image.position or 0) + 1 if last_image else 1

            url_images = [
                PropertyImage(property=instance, image_url=url, position=next_position + index) for index, url in enumerate(image_urls)
            ]
            if url_images:
                PropertyImage.objects.bulk_create(url_images)

            file_start = next_position + len(url_images)
            for index, image_file in enumerate(image_files, start=file_start):
                upload_result = cloudinary.uploader.upload(image_file, folder="immoalgeria/properties")
                PropertyImage.objects.create(
                    property=instance,
                    image_url=upload_result.get("secure_url") or upload_result.get("url") or "",
                    position=index,
                )

        return instance
