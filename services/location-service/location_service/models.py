from django.db import models


class Wilaya(models.Model):
    code = models.IntegerField(unique=True)
    postcode = models.CharField(max_length=20)
    name_ar = models.CharField(max_length=255)
    name_en = models.CharField(max_length=255)
    name_ber = models.CharField(max_length=255, null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    class Meta:
        db_table = 'Wilayas'


class Commune(models.Model):
    wilaya = models.ForeignKey(Wilaya, on_delete=models.PROTECT, db_column='Wilaya_Id')
    daira = models.ForeignKey("Daira", on_delete=models.PROTECT, db_column="Daira_Id", null=True, blank=True)
    code = models.IntegerField()
    name_ar = models.CharField(max_length=255)
    name_en = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    class Meta:
        db_table = 'Communes'


class Daira(models.Model):
    wilaya = models.ForeignKey(Wilaya, on_delete=models.PROTECT, db_column="Wilaya_Id")
    code = models.IntegerField()
    name_ar = models.CharField(max_length=255)
    name_en = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    class Meta:
        db_table = "Dairas"
