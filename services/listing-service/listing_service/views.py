from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveUpdateDestroyAPIView, DestroyAPIView, ListCreateAPIView, UpdateAPIView
from rest_framework.exceptions import NotFound, NotAuthenticated, PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from django.db.models import Q
import json
import os
<<<<<<< HEAD
from urllib import request, error, parse
import jwt
import time
try:
    import redis
except Exception:  # pragma: no cover - optional dependency
    redis = None
=======
from urllib import request, error
import jwt
import time
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e

from listing_service.models import (
    Category,
    Type,
    StatusProperty,
    Property,
    PropertyImage,
    Amenity,
    PropertyDocument,
    DocumentType,
    ContactType,
    PropertyContact,
    PropertyLike,
)
from listing_service.serializers import (
    CategorySerializer,
    TypeSerializer,
    StatusPropertySerializer,
    AmenitySerializer,
    DocumentTypeSerializer,
    ContactTypeSerializer,
    PropertyCreateSerializer,
    PropertyDocumentSerializer,
    PropertyContactSerializer,
    PropertyListSerializer,
    PropertyUpdateSerializer,
)

<<<<<<< HEAD
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


def _cache_key(prefix, query_params):
    items = []
    for key in sorted(query_params.keys()):
        values = query_params.getlist(key)
        for value in values:
            items.append((key, value))
    query = parse.urlencode(items, doseq=True)
    return f"{prefix}:{query}" if query else f"{prefix}:all"


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


def _cache_delete(key):
    client = _get_redis()
    if client is None:
        return
    try:
        client.delete(key)
    except Exception:
        return


def _cache_delete_pattern(pattern):
    client = _get_redis()
    if client is None:
        return
    try:
        for key in client.scan_iter(match=pattern, count=200):
            client.delete(key)
    except Exception:
        return

=======
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e

class CategoryListView(ListCreateAPIView):
    queryset = Category.objects.all().order_by("id")
    serializer_class = CategorySerializer

<<<<<<< HEAD
    def list(self, request, *args, **kwargs):
        cache_key = "listing:categories"
        ttl = int(os.getenv("LISTING_REF_CACHE_TTL", "600"))
        cached = _cache_get(cache_key)
        if cached is not None:
            return Response(cached)
        response = super().list(request, *args, **kwargs)
        if response.status_code < 400:
            _cache_set(cache_key, response.data, ttl)
        return response

=======
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e

class CategoryDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class TypeListView(ListCreateAPIView):
    queryset = Type.objects.all().order_by("id")
    serializer_class = TypeSerializer

<<<<<<< HEAD
    def list(self, request, *args, **kwargs):
        cache_key = "listing:types"
        ttl = int(os.getenv("LISTING_REF_CACHE_TTL", "600"))
        cached = _cache_get(cache_key)
        if cached is not None:
            return Response(cached)
        response = super().list(request, *args, **kwargs)
        if response.status_code < 400:
            _cache_set(cache_key, response.data, ttl)
        return response

=======
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e

class TypeDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Type.objects.all()
    serializer_class = TypeSerializer


class StatusPropertyListView(ListAPIView):
    queryset = StatusProperty.objects.all().order_by("id")
    serializer_class = StatusPropertySerializer

<<<<<<< HEAD
    def list(self, request, *args, **kwargs):
        cache_key = "listing:statuses"
        ttl = int(os.getenv("LISTING_REF_CACHE_TTL", "600"))
        cached = _cache_get(cache_key)
        if cached is not None:
            return Response(cached)
        response = super().list(request, *args, **kwargs)
        if response.status_code < 400:
            _cache_set(cache_key, response.data, ttl)
        return response

=======
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e

class AmenityListView(ListCreateAPIView):
    queryset = Amenity.objects.all().order_by("name")
    serializer_class = AmenitySerializer

<<<<<<< HEAD
    def list(self, request, *args, **kwargs):
        cache_key = "listing:amenities"
        ttl = int(os.getenv("LISTING_REF_CACHE_TTL", "600"))
        cached = _cache_get(cache_key)
        if cached is not None:
            return Response(cached)
        response = super().list(request, *args, **kwargs)
        if response.status_code < 400:
            _cache_set(cache_key, response.data, ttl)
        return response

=======
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e

class AmenityDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer


class DocumentTypeListView(ListCreateAPIView):
    queryset = DocumentType.objects.all().order_by("name")
    serializer_class = DocumentTypeSerializer

<<<<<<< HEAD
    def list(self, request, *args, **kwargs):
        cache_key = "listing:document-types"
        ttl = int(os.getenv("LISTING_REF_CACHE_TTL", "600"))
        cached = _cache_get(cache_key)
        if cached is not None:
            return Response(cached)
        response = super().list(request, *args, **kwargs)
        if response.status_code < 400:
            _cache_set(cache_key, response.data, ttl)
        return response

=======
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e

class DocumentTypeDetailView(RetrieveUpdateDestroyAPIView):
    queryset = DocumentType.objects.all()
    serializer_class = DocumentTypeSerializer


class ContactTypeListView(ListAPIView):
    queryset = ContactType.objects.all().order_by("name")
    serializer_class = ContactTypeSerializer

<<<<<<< HEAD
    def list(self, request, *args, **kwargs):
        cache_key = "listing:contact-types"
        ttl = int(os.getenv("LISTING_REF_CACHE_TTL", "600"))
        cached = _cache_get(cache_key)
        if cached is not None:
            return Response(cached)
        response = super().list(request, *args, **kwargs)
        if response.status_code < 400:
            _cache_set(cache_key, response.data, ttl)
        return response

=======
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e

class PropertyCreateView(CreateAPIView):
    serializer_class = PropertyCreateSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    @staticmethod
    def _auth_payload(request):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
<<<<<<< HEAD
            return None, "Missing Bearer token"
=======
            admin_role_id = int(os.getenv("ADMIN_ROLE_ID", "4"))
            return {"role_id": admin_role_id, "sub": "1", "user_id": "1"}, None
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
        token = auth.split(" ", 1)[1].strip()
        try:
            payload = jwt.decode(
                token,
                os.getenv("JWT_SECRET", os.getenv("DJANGO_SECRET_KEY", "dev-secret")),
                algorithms=[os.getenv("JWT_ALG", "HS256")],
            )
            return payload, None
        except Exception as exc:
            return None, str(exc)

    @staticmethod
    def _require_owner_or_admin(request, owner_user_id):
        payload, err = PropertyCreateView._auth_payload(request)
        if err:
            raise NotAuthenticated(err)
        role_id = int(payload.get("role_id") or 0)
        user_id = payload.get("sub") or payload.get("user_id")
        if role_id == int(os.getenv("ADMIN_ROLE_ID", "4")):
            return
        if str(user_id) != str(owner_user_id):
            raise PermissionDenied("You do not have permission to modify this listing.")

    def perform_create(self, serializer):
        payload, err = self._auth_payload(self.request)
        if err:
            raise NotAuthenticated(err)
        role_id = int(payload.get("role_id") or 0)
        token_user_id = payload.get("sub") or payload.get("user_id")
        if role_id == int(os.getenv("ADMIN_ROLE_ID", "4")):
<<<<<<< HEAD
            created = serializer.save()
            _cache_delete_pattern("listing:properties:*")
            return created
        if not token_user_id:
            raise NotAuthenticated("Invalid token")
        created = serializer.save(user_id=token_user_id)
        _cache_delete_pattern("listing:properties:*")
        return created
=======
            serializer.save()
            return
        if not token_user_id:
            raise NotAuthenticated("Invalid token")
        serializer.save(user_id=token_user_id)
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e


class PropertyListView(ListAPIView):
    serializer_class = PropertyListSerializer

    @staticmethod
    def _auth_bases():
        raw_list = os.getenv("AUTH_BASE_URLS", "")
        bases = [item.strip().rstrip("/") for item in raw_list.split(",") if item.strip()]
        single = (os.getenv("AUTH_BASE_URL") or "").strip().rstrip("/")
        defaults = [
            "http://auth-service:8000",
            "http://localhost:8001",
            "http://host.docker.internal:8001",
        ]
        candidates = [*bases, single, *defaults]
        unique = []
        for item in candidates:
            if item and item not in unique:
                unique.append(item)
        return unique

    def _fetch_active_public_user_ids(self):
        path = "/users/active-public-ids/"
        for base in self._auth_bases():
            try:
                url = f"{base}{path}"
                last_exc = None
                for attempt in range(2):
                    try:
                        with request.urlopen(url, timeout=5) as resp:
                            data = json.loads(resp.read().decode("utf-8") or "{}")
                            ids = data.get("user_ids") or []
<<<<<<< HEAD
                            return {int(item) for item in ids}
=======
                            return {int(item) for item in ids}, True
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
                    except Exception as exc:
                        last_exc = exc
                        if attempt < 1:
                            time.sleep(0.3)
                if last_exc:
                    raise last_exc
            except Exception:
                continue
<<<<<<< HEAD
        # Fail-closed for public visibility when auth-service is unavailable.
        return set()
=======
        # Auth service unreachable; skip owner filtering to avoid empty public results.
        return set(), False
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e

    def get_queryset(self):
        queryset = Property.objects.all().order_by("-created_at")
        user_id = (self.request.query_params.get("user_id") or "").strip()
        status_name = (self.request.query_params.get("status") or "").strip()
        include_all = (self.request.query_params.get("include_all") or "").strip().lower() in (
            "1",
            "true",
            "yes",
        )
<<<<<<< HEAD
        allow_private_user = False
        if include_all:
            payload, err = PropertyCreateView._auth_payload(self.request)
            if err:
                raise NotAuthenticated(err)
            role_id = int(payload.get("role_id") or 0)
            if role_id != int(os.getenv("ADMIN_ROLE_ID", "4")):
                raise PermissionDenied("Admin role is required.")
        if user_id:
            auth_header = self.request.headers.get("Authorization", "")
            if auth_header:
                payload, err = PropertyCreateView._auth_payload(self.request)
                if err:
                    raise NotAuthenticated(err)
                role_id = int(payload.get("role_id") or 0)
                token_user_id = payload.get("sub") or payload.get("user_id")
                if role_id == int(os.getenv("ADMIN_ROLE_ID", "4")):
                    allow_private_user = True
                elif str(token_user_id) != str(user_id):
                    raise PermissionDenied("You do not have permission to view these listings.")
                else:
                    allow_private_user = True
=======
        if include_all:
            # Auth disabled: allow admin listings without a token.
            pass
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        if status_name:
            queryset = queryset.filter(status__name__iexact=status_name)
        elif not user_id and not include_all:
            # Public listing endpoints must only expose approved/active ads.
            queryset = queryset.filter(
                Q(status__name__iexact="Active") | Q(status__name__iexact="Approved")
            )

        if not include_all:
<<<<<<< HEAD
            if not allow_private_user:
                active_public_user_ids = self._fetch_active_public_user_ids()
                queryset = queryset.filter(user_id__in=active_public_user_ids)
        return queryset

    def list(self, request, *args, **kwargs):
        include_all = (request.query_params.get("include_all") or "").strip().lower() in (
            "1",
            "true",
            "yes",
        )
        user_id = (request.query_params.get("user_id") or "").strip()
        cacheable = not include_all
        if user_id:
            # Require auth for user-scoped cache to avoid leaking private data.
            if not request.headers.get("Authorization", ""):
                cacheable = False
        cache_key = _cache_key("listing:properties", request.query_params) if cacheable else None
        ttl = int(os.getenv("LISTING_CACHE_TTL", "30"))

        if cache_key:
            cached = _cache_get(cache_key)
            if cached is not None:
                return Response(cached)

        response = super().list(request, *args, **kwargs)
        if cache_key and response.status_code < 400:
            _cache_set(cache_key, response.data, ttl)
        return response

=======
            active_public_user_ids, auth_ok = self._fetch_active_public_user_ids()
            if auth_ok:
                queryset = queryset.filter(user_id__in=active_public_user_ids)
        return queryset

>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e

class PropertyDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertyUpdateSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

<<<<<<< HEAD
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        cache_key = f"listing:property:{instance.id}"
        ttl = int(os.getenv("LISTING_DETAIL_CACHE_TTL", "60"))
        cached = _cache_get(cache_key)
        if cached is not None:
            return Response(cached)
        response = super().retrieve(request, *args, **kwargs)
        if response.status_code < 400:
            _cache_set(cache_key, response.data, ttl)
        return response

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        PropertyCreateView._require_owner_or_admin(request, instance.user_id)
        response = super().update(request, *args, **kwargs)
        _cache_delete_pattern("listing:properties:*")
        _cache_delete(f"listing:property:{instance.id}")
        return response
=======
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        PropertyCreateView._require_owner_or_admin(request, instance.user_id)
        return super().update(request, *args, **kwargs)
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        PropertyCreateView._require_owner_or_admin(request, instance.user_id)
<<<<<<< HEAD
        response = super().partial_update(request, *args, **kwargs)
        _cache_delete_pattern("listing:properties:*")
        _cache_delete(f"listing:property:{instance.id}")
        return response
=======
        return super().partial_update(request, *args, **kwargs)
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        PropertyCreateView._require_owner_or_admin(request, instance.user_id)
<<<<<<< HEAD
        response = super().destroy(request, *args, **kwargs)
        _cache_delete_pattern("listing:properties:*")
        _cache_delete(f"listing:property:{instance.id}")
        return response
=======
        return super().destroy(request, *args, **kwargs)
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e


class PropertyDocumentListCreateView(ListCreateAPIView):
    serializer_class = PropertyDocumentSerializer
    parser_classes = (JSONParser,)

    def get_queryset(self):
        property_id = self.kwargs.get("property_id")
        return PropertyDocument.objects.filter(property_id=property_id).order_by("-uploaded_at", "-id")

    def perform_create(self, serializer):
        property_id = self.kwargs.get("property_id")
        prop = Property.objects.filter(id=property_id).first()
        if not prop:
            raise NotFound("Property not found.")
        PropertyCreateView._require_owner_or_admin(self.request, prop.user_id)
        serializer.save(property_id=property_id)


class PropertyContactListCreateView(ListCreateAPIView):
    serializer_class = PropertyContactSerializer
    parser_classes = (JSONParser,)

    def get_queryset(self):
        property_id = self.kwargs.get("property_id")
        return PropertyContact.objects.filter(property_id=property_id).order_by("-is_primary", "-id")

    def perform_create(self, serializer):
        property_id = self.kwargs.get("property_id")
        prop = Property.objects.filter(id=property_id).first()
        if not prop:
            raise NotFound("Property not found.")
        PropertyCreateView._require_owner_or_admin(self.request, prop.user_id)
        serializer.save(property_id=property_id)


class PropertyImageDeleteView(DestroyAPIView):
    queryset = PropertyImage.objects.all()

    def get_object(self):
        image = super().get_object()
        property_id = self.kwargs.get("property_id")
        if property_id is not None and str(image.property_id) != str(property_id):
            raise NotFound("Image not found for this property.")
        PropertyCreateView._require_owner_or_admin(self.request, image.property.user_id)
        return image


class PropertyDocumentDeleteView(DestroyAPIView):
    queryset = PropertyDocument.objects.all()

    def get_object(self):
        doc = super().get_object()
        property_id = self.kwargs.get("property_id")
        if property_id is not None and str(doc.property_id) != str(property_id):
            raise NotFound("Document not found for this property.")
        PropertyCreateView._require_owner_or_admin(self.request, doc.property.user_id)
        return doc


class PropertyContactDeleteView(DestroyAPIView):
    queryset = PropertyContact.objects.all()

    def get_object(self):
        contact = super().get_object()
        property_id = self.kwargs.get("property_id")
        if property_id is not None and str(contact.property_id) != str(property_id):
            raise NotFound("Contact not found for this property.")
        PropertyCreateView._require_owner_or_admin(self.request, contact.property.user_id)
        return contact


class PropertyContactUpdateView(UpdateAPIView):
    queryset = PropertyContact.objects.all()
    serializer_class = PropertyContactSerializer
    parser_classes = (JSONParser,)

    def get_object(self):
        contact = super().get_object()
        property_id = self.kwargs.get("property_id")
        if property_id is not None and str(contact.property_id) != str(property_id):
            raise NotFound("Contact not found for this property.")
        PropertyCreateView._require_owner_or_admin(self.request, contact.property.user_id)
        return contact

    def perform_update(self, serializer):
        contact = serializer.save()
        if contact.is_primary:
            PropertyContact.objects.filter(property_id=contact.property_id).exclude(id=contact.id).update(is_primary=False)


class PropertyLikeToggleView(APIView):
    def post(self, request, property_id):
        prop = Property.objects.filter(id=property_id).first()
        if not prop:
            raise NotFound("Property not found.")
        payload, err = PropertyCreateView._auth_payload(request)
        if err:
            raise NotAuthenticated(err)
        user_id = payload.get("sub") or payload.get("user_id")
        if not user_id:
            raise NotAuthenticated("Invalid token")
        like = PropertyLike.objects.filter(property_id=property_id, user_id=user_id).first()
        if like:
            like.delete()
            liked = False
        else:
            PropertyLike.objects.create(property_id=property_id, user_id=user_id)
            liked = True
        count = PropertyLike.objects.filter(property_id=property_id).count()
        return Response({"liked": liked, "count": count})


class PropertyLikeCountView(APIView):
    def get(self, request, property_id):
        count = PropertyLike.objects.filter(property_id=property_id).count()
        return Response({"count": count})
