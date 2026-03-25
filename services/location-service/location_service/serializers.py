from rest_framework import serializers
from .models import Wilaya, Commune, Daira


class WilayaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wilaya
        fields = ['id', 'code', 'postcode', 'name_ar', 'name_en', 'name_ber', 'latitude', 'longitude']


class CommuneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commune
        fields = ['id', 'wilaya_id', 'daira_id', 'code', 'name_ar', 'name_en', 'latitude', 'longitude']


class DairaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Daira
        fields = ['id', 'wilaya_id', 'code', 'name_ar', 'name_en', 'latitude', 'longitude']
