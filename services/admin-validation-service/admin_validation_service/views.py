import json
import os
from urllib import error, parse, request

import jwt
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

ADMIN_ROLE_ID = 4


def _bases_from_env(list_var_name, single_var_name, default_values):
    env_list = os.getenv(list_var_name, "")
    candidates = [item.strip() for item in env_list.split(",") if item.strip()]
    candidates.extend([os.getenv(single_var_name, "").strip(), *default_values])
    unique = []
    for item in candidates:
        if not item:
            continue
        normalized = item.rstrip("/")
        if normalized not in unique:
            unique.append(normalized)
    return unique


def _listing_bases():
    return _bases_from_env(
        "LISTING_BASE_URLS",
        "LISTING_BASE_URL",
        [
            "http://listing-service:8000",
            "http://localhost:8004",
            "http://host.docker.internal:8004",
        ],
    )


def _auth_bases():
    return _bases_from_env(
        "AUTH_BASE_URLS",
        "AUTH_BASE_URL",
        [
            "http://auth-service:8000",
            "http://localhost:8001",
            "http://host.docker.internal:8001",
        ],
    )


def _decode_admin_user_id(request_obj):
    auth_header = request_obj.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return 1, None

    token = auth_header.split(" ", 1)[1].strip()
    try:
        payload = jwt.decode(token, options={"verify_signature": False, "verify_exp": False})
    except Exception:
        return None, "Invalid token"

    role_id = int(payload.get("role_id") or 0)
    if role_id != ADMIN_ROLE_ID:
        return None, "Admin role is required"

    user_id = int(payload.get("sub") or 0)
    if user_id <= 0:
        return None, "Invalid admin user id"
    return user_id, None


def _parse_body(resp):
    raw = resp.read()
    if not raw:
        return None
    content_type = (resp.headers.get("Content-Type") or "").lower()
    if "application/json" in content_type:
        try:
            return json.loads(raw.decode("utf-8"))
        except Exception:
            return {"detail": raw.decode("utf-8", errors="replace")}
    return {"detail": raw.decode("utf-8", errors="replace")}


def _forward(method, path, query_params=None, body=None, bases=None, extra_headers=None):
    query_string = ""
    if query_params:
        query_string = parse.urlencode(query_params, doseq=True)

    last_http_error = None
    last_network_error = None

    for base in (bases or _listing_bases()):
        url = f"{base}{path}"
        if query_string:
            url = f"{url}?{query_string}"

        payload = None if body is None else json.dumps(body).encode("utf-8")
        headers = dict(extra_headers or {})
        if payload is not None:
            headers["Content-Type"] = "application/json"

        req = request.Request(url=url, data=payload, headers=headers, method=method)
        try:
            with request.urlopen(req, timeout=10) as resp:
                return _parse_body(resp), resp.status
        except error.HTTPError as exc:
            last_http_error = (exc, _parse_body(exc))
            continue
        except Exception as exc:  # pragma: no cover - network fallback
            last_network_error = str(exc)
            continue

    if last_http_error:
        exc, parsed = last_http_error
        return parsed or {"detail": "Listing service error"}, exc.code

    return {"detail": f"Listing service unreachable: {last_network_error or 'unknown'}"}, 503


def _forward_auth(method, path, request_obj, query_params=None, body=None):
    auth_header = request_obj.headers.get("Authorization", "")
    headers = {"Authorization": auth_header} if auth_header else None
    return _forward(
        method,
        path,
        query_params=query_params,
        body=body,
        bases=_auth_bases(),
        extra_headers=headers,
    )


class AdminPropertyListView(APIView):
    def get(self, request_obj):
        admin_user_id, err = _decode_admin_user_id(request_obj)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        query = request_obj.query_params.copy()
        if (
            "include_all" not in query
            and "status" not in query
            and "user_id" not in query
        ):
            query["include_all"] = "1"

        data, code = _forward("GET", "/properties/list/", query_params=query)
        return Response(data, status=code)


class AdminStatusListView(APIView):
    def get(self, request_obj):
        admin_user_id, err = _decode_admin_user_id(request_obj)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        data, code = _forward("GET", "/statuses/")
        return Response(data, status=code)


class AdminPropertyDetailView(APIView):
    def patch(self, request_obj, pk):
        admin_user_id, err = _decode_admin_user_id(request_obj)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        data, code = _forward("PATCH", f"/properties/{pk}/", body=request_obj.data)
        return Response(data, status=code)


class AdminPropertyContactListView(APIView):
    def get(self, request_obj, property_id):
        admin_user_id, err = _decode_admin_user_id(request_obj)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        data, code = _forward("GET", f"/properties/{property_id}/contacts/")
        return Response(data, status=code)


class AdminCategoryListView(APIView):
    def get(self, request_obj):
        admin_user_id, err = _decode_admin_user_id(request_obj)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        data, code = _forward("GET", "/categories/")
        return Response(data, status=code)

    def post(self, request_obj):
        admin_user_id, err = _decode_admin_user_id(request_obj)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        data, code = _forward("POST", "/categories/", body=request_obj.data)
        return Response(data, status=code)


class AdminCategoryDetailView(APIView):
    def patch(self, request_obj, pk):
        admin_user_id, err = _decode_admin_user_id(request_obj)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        data, code = _forward("PATCH", f"/categories/{pk}/", body=request_obj.data)
        return Response(data, status=code)

    def delete(self, request_obj, pk):
        admin_user_id, err = _decode_admin_user_id(request_obj)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        data, code = _forward("DELETE", f"/categories/{pk}/")
        if data is None:
            return Response(status=code)
        return Response(data, status=code)


class AdminTypeListView(APIView):
    def get(self, request_obj):
        admin_user_id, err = _decode_admin_user_id(request_obj)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        data, code = _forward("GET", "/types/")
        return Response(data, status=code)

    def post(self, request_obj):
        admin_user_id, err = _decode_admin_user_id(request_obj)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        data, code = _forward("POST", "/types/", body=request_obj.data)
        return Response(data, status=code)


class AdminTypeDetailView(APIView):
    def patch(self, request_obj, pk):
        admin_user_id, err = _decode_admin_user_id(request_obj)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        data, code = _forward("PATCH", f"/types/{pk}/", body=request_obj.data)
        return Response(data, status=code)

    def delete(self, request_obj, pk):
        admin_user_id, err = _decode_admin_user_id(request_obj)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        data, code = _forward("DELETE", f"/types/{pk}/")
        if data is None:
            return Response(status=code)
        return Response(data, status=code)


class AdminAmenityListView(APIView):
    def get(self, request_obj):
        admin_user_id, err = _decode_admin_user_id(request_obj)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        data, code = _forward("GET", "/amenities/")
        return Response(data, status=code)

    def post(self, request_obj):
        admin_user_id, err = _decode_admin_user_id(request_obj)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        data, code = _forward("POST", "/amenities/", body=request_obj.data)
        return Response(data, status=code)


class AdminAmenityDetailView(APIView):
    def patch(self, request_obj, pk):
        admin_user_id, err = _decode_admin_user_id(request_obj)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        data, code = _forward("PATCH", f"/amenities/{pk}/", body=request_obj.data)
        return Response(data, status=code)

    def delete(self, request_obj, pk):
        admin_user_id, err = _decode_admin_user_id(request_obj)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        data, code = _forward("DELETE", f"/amenities/{pk}/")
        if data is None:
            return Response(status=code)
        return Response(data, status=code)


class AdminDocumentTypeListView(APIView):
    def get(self, request_obj):
        admin_user_id, err = _decode_admin_user_id(request_obj)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        data, code = _forward("GET", "/document-types/")
        return Response(data, status=code)

    def post(self, request_obj):
        admin_user_id, err = _decode_admin_user_id(request_obj)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        data, code = _forward("POST", "/document-types/", body=request_obj.data)
        return Response(data, status=code)


class AdminDocumentTypeDetailView(APIView):
    def patch(self, request_obj, pk):
        admin_user_id, err = _decode_admin_user_id(request_obj)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        data, code = _forward("PATCH", f"/document-types/{pk}/", body=request_obj.data)
        return Response(data, status=code)

    def delete(self, request_obj, pk):
        admin_user_id, err = _decode_admin_user_id(request_obj)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        data, code = _forward("DELETE", f"/document-types/{pk}/")
        if data is None:
            return Response(status=code)
        return Response(data, status=code)


class AdminRoleListView(APIView):
    def get(self, request_obj):
        admin_user_id, err = _decode_admin_user_id(request_obj)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        data, code = _forward_auth("GET", "/roles/", request_obj)
        return Response(data, status=code)


class AdminUserListView(APIView):
    def get(self, request_obj):
        admin_user_id, err = _decode_admin_user_id(request_obj)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        data, code = _forward_auth("GET", "/users/", request_obj)
        return Response(data, status=code)

    def post(self, request_obj):
        admin_user_id, err = _decode_admin_user_id(request_obj)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        data, code = _forward_auth("POST", "/users/", request_obj, body=request_obj.data)
        return Response(data, status=code)


class AdminUserDetailView(APIView):
    def patch(self, request_obj, pk):
        admin_user_id, err = _decode_admin_user_id(request_obj)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        data, code = _forward_auth("PATCH", f"/users/{pk}/", request_obj, body=request_obj.data)
        return Response(data, status=code)

    def delete(self, request_obj, pk):
        admin_user_id, err = _decode_admin_user_id(request_obj)
        if err:
            return Response({"detail": err}, status=status.HTTP_401_UNAUTHORIZED)

        data, code = _forward_auth("DELETE", f"/users/{pk}/", request_obj)
        if data is None:
            return Response(status=code)
        return Response(data, status=code)
