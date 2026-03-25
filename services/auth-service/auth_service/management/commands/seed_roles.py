from django.core.management.base import BaseCommand

from auth_service.models import Role


class Command(BaseCommand):
    help = "Seed default roles with fixed IDs."

    def handle(self, *args, **options):
        roles = [
            (1, "user"),
            (2, "agence"),
            (3, "promoteur"),
            (4, "admin"),
        ]

        created = 0
        for role_id, name in roles:
            role, was_created = Role.objects.update_or_create(
                id=role_id, defaults={"name": name}
            )
            if was_created:
                created += 1
            self.stdout.write(f"Role {role.id} => {role.name}")

        self.stdout.write(self.style.SUCCESS(f"Done. Created {created} role(s)."))
