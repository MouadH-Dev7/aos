from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("listing_service", "0002_propertyimage_image_file_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="Amenity",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=150, unique=True)),
            ],
            options={
                "db_table": "Amenities",
            },
        ),
        migrations.AddField(
            model_name="property",
            name="amenities",
            field=models.ManyToManyField(blank=True, db_table="Property_Amenities", related_name="properties", to="listing_service.amenity"),
        ),
    ]
