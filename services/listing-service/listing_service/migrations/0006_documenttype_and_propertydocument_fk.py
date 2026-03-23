from django.db import migrations, models


def seed_document_types(apps, schema_editor):
    DocumentType = apps.get_model("listing_service", "DocumentType")
    for name in ["عقد فردي", "عقد جماعي", "دفتر عقاري"]:
        DocumentType.objects.get_or_create(name=name)


class Migration(migrations.Migration):
    dependencies = [
        ("listing_service", "0005_propertydocument_name_only"),
    ]

    operations = [
        migrations.CreateModel(
            name="DocumentType",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=150, unique=True)),
            ],
            options={
                "db_table": "Document_Types",
            },
        ),
        migrations.AddField(
            model_name="propertydocument",
            name="document_type",
            field=models.ForeignKey(db_column="Document_Type_Id", on_delete=models.deletion.PROTECT, to="listing_service.documenttype", null=True),
        ),
        migrations.RunPython(seed_document_types, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="propertydocument",
            name="document_type",
            field=models.ForeignKey(db_column="Document_Type_Id", on_delete=models.deletion.PROTECT, to="listing_service.documenttype"),
        ),
    ]
