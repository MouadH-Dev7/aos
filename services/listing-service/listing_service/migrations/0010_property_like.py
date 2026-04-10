from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("listing_service", "0009_seed_statuses"),
    ]

    operations = [
        migrations.CreateModel(
            name="PropertyLike",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("user_id", models.IntegerField(db_column="User_Id", db_index=True)),
                ("created_at", models.DateTimeField(auto_now_add=True, db_column="Created_At")),
                ("property", models.ForeignKey(db_column="Property_Id", on_delete=models.deletion.CASCADE, to="listing_service.property")),
            ],
            options={
                "db_table": "Property_Likes",
            },
        ),
        migrations.AddConstraint(
            model_name="propertylike",
            constraint=models.UniqueConstraint(fields=("property", "user_id"), name="unique_property_like"),
        ),
    ]
