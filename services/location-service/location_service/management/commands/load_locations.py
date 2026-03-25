import csv
import html
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction

from location_service.models import Wilaya, Commune, Daira


class Command(BaseCommand):
    help = "Load wilayas, dairas, and communes from tab-separated files."

    def add_arguments(self, parser):
        parser.add_argument("--wilayas", default="Wilayas.txt", help="Path to Wilayas.txt file")
        parser.add_argument("--dairas", default="Dairas.txt", help="Path to Dairas.txt file")
        parser.add_argument("--communes", default="Communes.txt", help="Path to Communes.txt file")

    def handle(self, *args, **options):
        wilaya_path = Path(options["wilayas"]).resolve()
        daira_path = Path(options["dairas"]).resolve()
        commune_path = Path(options["communes"]).resolve()

        for label, path in [("wilayas", wilaya_path), ("dairas", daira_path), ("communes", commune_path)]:
            if not path.exists():
                self.stderr.write(f"{label} file not found: {path}")
                return

        wilaya_lines = [l for l in wilaya_path.read_text(encoding="utf-8", errors="replace").splitlines() if l.strip()]
        daira_lines = [l for l in daira_path.read_text(encoding="utf-8", errors="replace").splitlines() if l.strip()]
        commune_lines = [l for l in commune_path.read_text(encoding="utf-8", errors="replace").splitlines() if l.strip()]

        if not wilaya_lines or not daira_lines or not commune_lines:
            self.stderr.write("One or more input files are empty after cleaning.")
            return

        def normalize_row(row):
            return {
                (key or "").lstrip("\ufeff").strip(): (value.strip() if isinstance(value, str) else value)
                for key, value in row.items()
            }

        def parse_int(val):
            try:
                return int(str(val).strip())
            except Exception:
                return None

        def parse_float(val):
            try:
                return float(str(val).strip())
            except Exception:
                return None

        with transaction.atomic():
            wilaya_reader = csv.DictReader(wilaya_lines, delimiter="\t")
            for row in wilaya_reader:
                row = normalize_row(row)
                if not row.get("id"):
                    continue
                Wilaya.objects.update_or_create(
                    id=parse_int(row["id"]),
                    defaults={
                        "code": parse_int(row.get("code")),
                        "postcode": row.get("postcode", ""),
                        "name_ar": html.unescape(row.get("name_ar", "")),
                        "name_en": html.unescape(row.get("name_en", "")),
                        "name_ber": html.unescape(row.get("name_ber", "")) or None,
                        "latitude": parse_float(row.get("latitude")),
                        "longitude": parse_float(row.get("longitude")),
                    },
                )

            daira_reader = csv.DictReader(daira_lines, delimiter="\t")
            for row in daira_reader:
                row = normalize_row(row)
                if not row.get("Id"):
                    continue
                Daira.objects.update_or_create(
                    id=parse_int(row["Id"]),
                    defaults={
                        "wilaya_id": parse_int(row.get("Wilaya_Id")),
                        "code": parse_int(row.get("Code")),
                        "name_ar": html.unescape(row.get("Name_Ar", "")),
                        "name_en": html.unescape(row.get("Name_En", "")),
                        "latitude": parse_float(row.get("Latitude")),
                        "longitude": parse_float(row.get("Longitude")),
                    },
                )

            daira_to_wilaya = {d.id: d.wilaya_id for d in Daira.objects.all()}

            commune_reader = csv.DictReader(commune_lines, delimiter="\t")
            created = 0
            skipped = 0
            for row in commune_reader:
                row = normalize_row(row)
                if not row.get("Id"):
                    skipped += 1
                    continue
                daira_id = parse_int(row.get("Daira_Id"))
                wilaya_id = daira_to_wilaya.get(daira_id)
                if daira_id and not wilaya_id:
                    self.stderr.write(f"Missing Wilaya for Daira_Id={daira_id} (Commune Id={row.get('Id')})")
                    skipped += 1
                    continue
                Commune.objects.update_or_create(
                    id=parse_int(row["Id"]),
                    defaults={
                        "wilaya_id": wilaya_id,
                        "daira_id": daira_id,
                        "code": parse_int(row.get("Code")),
                        "name_ar": html.unescape(row.get("Name_Ar", "")),
                        "name_en": html.unescape(row.get("Name_En", "")),
                        "latitude": parse_float(row.get("Latitude")),
                        "longitude": parse_float(row.get("Longitude")),
                    },
                )
                created += 1

        self.stdout.write(self.style.SUCCESS(f"Locations loaded successfully. Communes created: {created}, skipped: {skipped}."))
