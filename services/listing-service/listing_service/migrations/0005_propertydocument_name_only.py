from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("listing_service", "0004_propertydocument"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="propertydocument",
            name="file_file",
        ),
        migrations.RemoveField(
            model_name="propertydocument",
            name="file_url",
        ),
    ]
