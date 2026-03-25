<<<<<<< HEAD
from django.urls import path, include
=======
from django.urls import path
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
from django.http import JsonResponse

from location_service.views import WilayaListView, CommuneListView, DairaListView


def health(request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("health/", health),
<<<<<<< HEAD
    path("metrics/", include("django_prometheus.urls")),
=======
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
    path("wilayas/", WilayaListView.as_view()),
    path("dairas/", DairaListView.as_view()),
    path("communes/", CommuneListView.as_view()),
]
