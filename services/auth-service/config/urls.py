from django.urls import path, include
from django.http import JsonResponse


def health(request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("health/", health),
    path("metrics/", include("django_prometheus.urls")),
    path("", include("auth_service.urls")),
]

