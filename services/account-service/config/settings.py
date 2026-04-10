from pathlib import Path
import os

<<<<<<< HEAD
import dj_database_url
=======
>>>>>>> 0a3aee41df08352ed85b07b5fe48d7f19cfc7a08
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

<<<<<<< HEAD
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-secret-change-me")
DEBUG = os.getenv("DJANGO_DEBUG", "false").lower() == "true"
ALLOWED_HOSTS = [
    item.strip()
    for item in os.getenv("ALLOWED_HOSTS", ".onrender.com,localhost,127.0.0.1").split(",")
    if item.strip()
]
=======
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-secret")
DEBUG = os.getenv("DJANGO_DEBUG", "true").lower() == "true"
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "*").split(",")
>>>>>>> 0a3aee41df08352ed85b07b5fe48d7f19cfc7a08

INSTALLED_APPS = [
    "django_prometheus",
    "account_service",
    "django.contrib.contenttypes",
    "django.contrib.auth",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
]

MIDDLEWARE = [
    "django_prometheus.middleware.PrometheusBeforeMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.gzip.GZipMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django_prometheus.middleware.PrometheusAfterMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ]
        },
    }
]

WSGI_APPLICATION = "config.wsgi.application"

<<<<<<< HEAD
DB_CONN_MAX_AGE = int(os.getenv("DB_CONN_MAX_AGE", "120"))
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

if DATABASE_URL:
    default_db = dj_database_url.parse(DATABASE_URL, conn_max_age=DB_CONN_MAX_AGE)
    default_db["ENGINE"] = "django_prometheus.db.backends.postgresql"
    DATABASES = {"default": default_db}
else:
    DATABASES = {
        "default": {
            "ENGINE": "django_prometheus.db.backends.postgresql",
            "NAME": os.getenv("DB_NAME", ""),
            "USER": os.getenv("DB_USER", "postgres"),
            "PASSWORD": os.getenv("DB_PASSWORD", "postgres"),
            "HOST": os.getenv("DB_HOST", "localhost"),
            "PORT": os.getenv("DB_PORT", "5432"),
            "CONN_MAX_AGE": DB_CONN_MAX_AGE,
        }
    }

=======
DATABASES = {
    "default": {
        "ENGINE": "django_prometheus.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME", ""),
        "USER": os.getenv("DB_USER", "postgres"),
        "PASSWORD": os.getenv("DB_PASSWORD", "postgres"),
        "HOST": os.getenv("DB_HOST", "localhost"),
        "PORT": os.getenv("DB_PORT", "5432"),
        "CONN_MAX_AGE": int(os.getenv("DB_CONN_MAX_AGE", "120")),
        "OPTIONS": {},
    }
}

db_sslmode = os.getenv("DB_SSLMODE", "").strip()
db_connect_timeout = os.getenv("DB_CONNECT_TIMEOUT", "").strip()
if db_sslmode:
    DATABASES["default"]["OPTIONS"]["sslmode"] = db_sslmode
if db_connect_timeout:
    DATABASES["default"]["OPTIONS"]["connect_timeout"] = int(db_connect_timeout)
>>>>>>> 0a3aee41df08352ed85b07b5fe48d7f19cfc7a08
LANGUAGE_CODE = "fr-fr"
TIME_ZONE = "Africa/Algiers"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

<<<<<<< HEAD
CORS_ALLOW_ALL_ORIGINS = os.getenv("CORS_ALLOW_ALL_ORIGINS", "false").lower() == "true"
CORS_ALLOWED_ORIGINS = [
    item.strip()
    for item in os.getenv(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:5173,http://localhost:5174,http://localhost:5175",
    ).split(",")
    if item.strip()
]
CSRF_TRUSTED_ORIGINS = [
    item.strip()
    for item in os.getenv(
        "CSRF_TRUSTED_ORIGINS",
        "http://localhost:5173,http://localhost:5174,http://localhost:5175,https://*.onrender.com",
    ).split(",")
    if item.strip()
]

if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    USE_X_FORWARDED_HOST = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
=======
# Dev/prod: allow configured frontend origins (fallback to allow all)
CORS_ALLOWED_ORIGINS = []
_cors_allowed = os.getenv("CORS_ALLOWED_ORIGINS", "").strip()
if _cors_allowed:
    CORS_ALLOWED_ORIGINS = [item.strip() for item in _cors_allowed.split(",") if item.strip()]
if CORS_ALLOWED_ORIGINS:
    CORS_ALLOW_ALL_ORIGINS = False
else:
    CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS
>>>>>>> 0a3aee41df08352ed85b07b5fe48d7f19cfc7a08

REST_FRAMEWORK = {
    "DEFAULT_PAGINATION_CLASS": "account_service.pagination.OptionalPageNumberPagination",
    "PAGE_SIZE": int(os.getenv("PAGINATION_PAGE_SIZE", "20")),
}
