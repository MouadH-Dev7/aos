from django.urls import path, include
from django.http import JsonResponse

from account_service.views import (
    ProfileListCreateView,
    AgenceListCreateView,
    PromoteurListCreateView,
    AgenceDetailView,
    PromoteurDetailView,
    ProfileByUserView,
    AgenceByUserView,
    PromoteurByUserView,
)


def health(request):
    return JsonResponse({"status": "ok"})

urlpatterns = [
    path("health/", health),
    path("metrics/", include("django_prometheus.urls")),
    path("profiles/", ProfileListCreateView.as_view()),
    path("profiles/by-user/<int:user_id>/", ProfileByUserView.as_view()),
    path("agences/", AgenceListCreateView.as_view()),
    path("agences/<int:pk>/", AgenceDetailView.as_view()),
    path("agences/by-user/<int:user_id>/", AgenceByUserView.as_view()),
    path("promoteurs/", PromoteurListCreateView.as_view()),
    path("promoteurs/<int:pk>/", PromoteurDetailView.as_view()),
    path("promoteurs/by-user/<int:user_id>/", PromoteurByUserView.as_view()),
]
