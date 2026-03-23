from django.urls import include, path
from django.http import JsonResponse


def health(request):
    return JsonResponse({"status": "ok"})

urlpatterns = [
    path("health/", health),
    path("", include("admin_validation_service.urls")),
]
