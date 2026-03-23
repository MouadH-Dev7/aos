from django.db import migrations


def seed_statuses(apps, schema_editor):
    StatusProperty = apps.get_model("listing_service", "StatusProperty")
    for name in ["Pending", "Active", "Rejected"]:
        StatusProperty.objects.get_or_create(name=name)


class Migration(migrations.Migration):
    dependencies = [
        ("listing_service", "0008_contacts"),
    ]

    operations = [
        migrations.RunPython(seed_statuses, migrations.RunPython.noop),
    ]
