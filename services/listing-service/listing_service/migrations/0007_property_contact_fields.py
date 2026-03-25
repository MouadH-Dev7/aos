from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("listing_service", "0006_documenttype_and_propertydocument_fk"),
    ]

    operations = [
        migrations.AddField(
            model_name="property",
            name="contact_phone",
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
        migrations.AddField(
            model_name="property",
            name="contact_email",
            field=models.EmailField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name="property",
            name="contact_phone_alt",
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
        migrations.AddField(
            model_name="property",
            name="contact_email_alt",
            field=models.EmailField(blank=True, max_length=255, null=True),
        ),
    ]
