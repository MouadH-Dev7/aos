from django.urls import include, path
from django.http import JsonResponse


def health(request):
    return JsonResponse({"status": "ok"})

urlpatterns = [
    path("health/", health),
<<<<<<< HEAD
    path("metrics/", include("django_prometheus.urls")),
=======
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
    path("", include("admin_validation_service.urls")),
]
