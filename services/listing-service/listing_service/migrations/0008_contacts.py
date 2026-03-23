from django.db import migrations, models


def seed_contact_types(apps, schema_editor):
    ContactType = apps.get_model("listing_service", "ContactType")
    for name in ["Phone", "Email", "WhatsApp", "Telegram", "Fax"]:
        ContactType.objects.get_or_create(name=name)


class Migration(migrations.Migration):
    dependencies = [
        ("listing_service", "0007_property_contact_fields"),
    ]

    operations = [
        migrations.CreateModel(
            name="ContactType",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100, unique=True)),
            ],
            options={"db_table": "Contact_Types"},
        ),
        migrations.CreateModel(
            name="PropertyContact",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("value", models.CharField(max_length=255)),
                ("is_primary", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True, db_column="Created_At")),
                ("contact_type", models.ForeignKey(db_column="Contact_Type_Id", on_delete=models.deletion.PROTECT, to="listing_service.contacttype")),
                ("property", models.ForeignKey(db_column="Property_Id", on_delete=models.deletion.CASCADE, to="listing_service.property")),
            ],
            options={"db_table": "Property_Contacts"},
        ),
        migrations.RunPython(seed_contact_types, migrations.RunPython.noop),
        migrations.RemoveField(model_name="property", name="contact_phone"),
        migrations.RemoveField(model_name="property", name="contact_email"),
        migrations.RemoveField(model_name="property", name="contact_phone_alt"),
        migrations.RemoveField(model_name="property", name="contact_email_alt"),
    ]
