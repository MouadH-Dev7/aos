from django.core.management.base import BaseCommand

from listing_service.models import Category, Type


class Command(BaseCommand):
    help = "Seed Categories and Types tables with default values."

    def handle(self, *args, **options):
        categories = [
            (1, "Appartement"),
            (5, "Bureau"),
            (7, "Ferme"),
            (4, "Magasin"),
            (2, "Maison"),
            (3, "Terrain"),
            (6, "Villa"),
        ]

        types = [
            (3, "Echange"),
            (2, "Location"),
            (4, "Location saisonnière"),
            (1, "Vente"),
        ]

        categories_created = 0
        types_created = 0

        for cat_id, name in categories:
            _, created = Category.objects.update_or_create(id=cat_id, defaults={"name": name})
            if created:
                categories_created += 1

        for type_id, name in types:
            _, created = Type.objects.update_or_create(id=type_id, defaults={"name": name})
            if created:
                types_created += 1

        self.stdout.write(self.style.SUCCESS("Listing seed data loaded successfully."))
        self.stdout.write(f"Categories created: {categories_created}, updated: {len(categories) - categories_created}")
        self.stdout.write(f"Types created: {types_created}, updated: {len(types) - types_created}")
