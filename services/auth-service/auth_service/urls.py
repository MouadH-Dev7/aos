from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    RefreshView,
    MeView,
    RoleListView,
    UserListView,
    UserDetailView,
    ActivePublicUserIdsView,
)

urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("login/", LoginView.as_view()),
    path("refresh/", RefreshView.as_view()),
    path("me/", MeView.as_view()),
    path("roles/", RoleListView.as_view()),
    path("users/", UserListView.as_view()),
    path("users/<int:pk>/", UserDetailView.as_view()),
    path("users/active-public-ids/", ActivePublicUserIdsView.as_view()),
]
