import json
import os

from rest_framework import generics
from rest_framework.response import Response

try:
    import redis
except Exception:  # pragma: no cover - optional dependency
    redis = None

from .models import Wilaya, Commune, Daira
from .serializers import WilayaSerializer, CommuneSerializer, DairaSerializer

_redis_client = None


def _get_redis():
    global _redis_client
    if _redis_client is not None:
        return _redis_client
    if redis is None:
        return None
    url = os.getenv("REDIS_URL")
    if not url:
        return None
    try:
        _redis_client = redis.Redis.from_url(url, decode_responses=True)
    except Exception:
        _redis_client = None
    return _redis_client


def _cache_get(key):
    client = _get_redis()
    if client is None:
        return None
    try:
        raw = client.get(key)
        if not raw:
            return None
        return json.loads(raw)
    except Exception:
        return None


def _cache_set(key, payload, ttl):
    client = _get_redis()
    if client is None:
        return
    try:
        client.setex(key, ttl, json.dumps(payload))
    except Exception:
        return


class WilayaListView(generics.ListAPIView):
    queryset = Wilaya.objects.all().order_by('id')
    serializer_class = WilayaSerializer

    def list(self, request, *args, **kwargs):
        ttl = int(os.getenv("LOCATION_CACHE_TTL", "900"))
        cache_key = "location:wilayas"
        cached = _cache_get(cache_key)
        if cached is not None:
            return Response(cached)
        response = super().list(request, *args, **kwargs)
        if response.status_code < 400:
            _cache_set(cache_key, response.data, ttl)
        return response


class CommuneListView(generics.ListAPIView):
    queryset = Commune.objects.all().order_by('id')
    serializer_class = CommuneSerializer

    def list(self, request, *args, **kwargs):
        ttl = int(os.getenv("LOCATION_CACHE_TTL", "900"))
        cache_key = "location:communes"
        cached = _cache_get(cache_key)
        if cached is not None:
            return Response(cached)
        response = super().list(request, *args, **kwargs)
        if response.status_code < 400:
            _cache_set(cache_key, response.data, ttl)
        return response


class DairaListView(generics.ListAPIView):
    queryset = Daira.objects.all().order_by('id')
    serializer_class = DairaSerializer

    def list(self, request, *args, **kwargs):
        ttl = int(os.getenv("LOCATION_CACHE_TTL", "900"))
        cache_key = "location:dairas"
        cached = _cache_get(cache_key)
        if cached is not None:
            return Response(cached)
        response = super().list(request, *args, **kwargs)
        if response.status_code < 400:
            _cache_set(cache_key, response.data, ttl)
        return response
