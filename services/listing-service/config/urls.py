from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from django.http import JsonResponse


def health(request):
    return JsonResponse({"status": "ok"})

urlpatterns = [
    path("health/", health),
<<<<<<< HEAD
    path("metrics/", include("django_prometheus.urls")),
=======
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
    path("", include("listing_service.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
