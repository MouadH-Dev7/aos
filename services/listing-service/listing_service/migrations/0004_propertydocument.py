from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("listing_service", "0003_amenity_and_property_amenities"),
    ]

    operations = [
        migrations.CreateModel(
            name="PropertyDocument",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(blank=True, max_length=255)),
                ("file_file", models.FileField(blank=True, db_column="File_File", null=True, upload_to="property_documents/")),
                ("file_url", models.CharField(blank=True, db_column="File_Url", max_length=510, null=True)),
                ("uploaded_at", models.DateTimeField(auto_now_add=True, db_column="Uploaded_At")),
                ("property", models.ForeignKey(db_column="Property_Id", on_delete=models.deletion.CASCADE, to="listing_service.property")),
            ],
            options={
                "db_table": "Property_Documents",
            },
        ),
    ]
