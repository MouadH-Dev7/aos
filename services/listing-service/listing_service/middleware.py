from django.conf import settings
from django.http import HttpResponse


class CorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method == "OPTIONS":
            response = HttpResponse(status=200)
        else:
            response = self.get_response(request)

        origin = request.headers.get("Origin", "")
        allowed_origins = set(getattr(settings, "CORS_ALLOWED_ORIGINS", []))
        allow_all = getattr(settings, "CORS_ALLOW_ALL_ORIGINS", False)

        if allow_all and origin:
            response["Access-Control-Allow-Origin"] = origin
        elif origin and origin in allowed_origins:
            response["Access-Control-Allow-Origin"] = origin
        elif allow_all:
            response["Access-Control-Allow-Origin"] = "*"
        else:
            return response

        response["Vary"] = "Origin"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        response["Access-Control-Allow-Credentials"] = "true"
        response["Access-Control-Max-Age"] = "86400"
        return response
