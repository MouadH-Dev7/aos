from rest_framework import generics

from .models import Wilaya, Commune, Daira
from .serializers import WilayaSerializer, CommuneSerializer, DairaSerializer


class WilayaListView(generics.ListAPIView):
    queryset = Wilaya.objects.all().order_by('id')
    serializer_class = WilayaSerializer


class CommuneListView(generics.ListAPIView):
    queryset = Commune.objects.all().order_by('id')
    serializer_class = CommuneSerializer


class DairaListView(generics.ListAPIView):
    queryset = Daira.objects.all().order_by('id')
    serializer_class = DairaSerializer
