from django.urls import path

from admin_validation_service.views import (
    AdminAmenityDetailView,
    AdminAmenityListView,
    AdminCategoryDetailView,
    AdminCategoryListView,
    AdminDocumentTypeDetailView,
    AdminDocumentTypeListView,
    AdminPropertyContactListView,
    AdminPropertyDetailView,
    AdminPropertyListView,
    AdminRoleListView,
    AdminStatusListView,
    AdminTypeDetailView,
    AdminTypeListView,
    AdminUserDetailView,
    AdminUserListView,
)


urlpatterns = [
    path("listings/", AdminPropertyListView.as_view(), name="admin-listings"),
    path("statuses/", AdminStatusListView.as_view(), name="admin-statuses"),
    path("properties/<int:pk>/", AdminPropertyDetailView.as_view(), name="admin-property-detail"),
    path("properties/<int:property_id>/contacts/", AdminPropertyContactListView.as_view(), name="admin-property-contacts"),
    path("categories/", AdminCategoryListView.as_view(), name="admin-categories"),
    path("categories/<int:pk>/", AdminCategoryDetailView.as_view(), name="admin-category-detail"),
    path("types/", AdminTypeListView.as_view(), name="admin-types"),
    path("types/<int:pk>/", AdminTypeDetailView.as_view(), name="admin-type-detail"),
    path("amenities/", AdminAmenityListView.as_view(), name="admin-amenities"),
    path("amenities/<int:pk>/", AdminAmenityDetailView.as_view(), name="admin-amenity-detail"),
    path("document-types/", AdminDocumentTypeListView.as_view(), name="admin-document-types"),
    path("document-types/<int:pk>/", AdminDocumentTypeDetailView.as_view(), name="admin-document-type-detail"),
    path("roles/", AdminRoleListView.as_view(), name="admin-roles"),
    path("users/", AdminUserListView.as_view(), name="admin-users"),
    path("users/<int:pk>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
]
