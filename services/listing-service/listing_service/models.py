from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=510, unique=True)

    class Meta:
        db_table = "Categories"


class Type(models.Model):
    name = models.CharField(max_length=510, unique=True)

    class Meta:
        db_table = "Types"


class StatusProperty(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = "Status_Properties"


class Amenity(models.Model):
    name = models.CharField(max_length=150, unique=True)

    class Meta:
        db_table = "Amenities"


class Property(models.Model):
    user_id = models.IntegerField(db_column="User_Id", db_index=True)
    commune_id = models.IntegerField(db_column="Commune_Id", db_index=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, db_column="Category_Id")
    type = models.ForeignKey(Type, on_delete=models.PROTECT, db_column="Type_Id")
    title = models.CharField(max_length=510)
    description = models.TextField()
    price = models.DecimalField(max_digits=18, decimal_places=2)
    area = models.FloatField(null=True, blank=True)
    bedrooms = models.IntegerField()
    bathrooms = models.IntegerField()
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True, auto_now_add=True, db_column="Created_At")
    status = models.ForeignKey(StatusProperty, on_delete=models.PROTECT, db_column="Status_Id")
    amenities = models.ManyToManyField(Amenity, blank=True, related_name="properties", db_table="Property_Amenities")

    class Meta:
        db_table = "Properties"


class PropertyImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, db_column="Property_Id")
    image_file = models.ImageField(upload_to="property_images/", null=True, blank=True, db_column="Image_File")
    image_url = models.CharField(max_length=510, db_column="Image_Url", blank=True, null=True)
    position = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = "Property_Images"


class PropertyDocument(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, db_column="Property_Id")
    document_type = models.ForeignKey("DocumentType", on_delete=models.PROTECT, db_column="Document_Type_Id")
    name = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True, db_column="Uploaded_At")

    class Meta:
        db_table = "Property_Documents"


class DocumentType(models.Model):
    name = models.CharField(max_length=150, unique=True)

    class Meta:
        db_table = "Document_Types"


class ContactType(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = "Contact_Types"


class PropertyContact(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, db_column="Property_Id")
    contact_type = models.ForeignKey(ContactType, on_delete=models.PROTECT, db_column="Contact_Type_Id")
    value = models.CharField(max_length=255)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, db_column="Created_At")

    class Meta:
        db_table = "Property_Contacts"


class PropertyLike(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, db_column="Property_Id")
    user_id = models.IntegerField(db_column="User_Id", db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_column="Created_At")

    class Meta:
        db_table = "Property_Likes"
        constraints = [
            models.UniqueConstraint(fields=["property", "user_id"], name="unique_property_like"),
        ]
