from django.urls import path, include
from django.http import JsonResponse

from location_service.views import WilayaListView, CommuneListView, DairaListView


def health(request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("health/", health),
    path("metrics/", include("django_prometheus.urls")),
    path("wilayas/", WilayaListView.as_view()),
    path("dairas/", DairaListView.as_view()),
    path("communes/", CommuneListView.as_view()),
]
