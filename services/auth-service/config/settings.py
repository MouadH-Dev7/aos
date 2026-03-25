from pathlib import Path
import os

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-secret")
DEBUG = os.getenv("DJANGO_DEBUG", "true").lower() == "true"
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "*").split(",")

INSTALLED_APPS = [
<<<<<<< HEAD
    "django_prometheus",
=======
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
    "auth_service",
    "django.contrib.contenttypes",
    "django.contrib.auth",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
]

MIDDLEWARE = [
<<<<<<< HEAD
    "django_prometheus.middleware.PrometheusBeforeMiddleware",
=======
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.gzip.GZipMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
<<<<<<< HEAD
    "django_prometheus.middleware.PrometheusAfterMiddleware",
=======
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
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

DATABASES = {
    "default": {
<<<<<<< HEAD
        "ENGINE": "django_prometheus.db.backends.postgresql",
=======
        "ENGINE": "django.db.backends.postgresql",
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
        "NAME": os.getenv("DB_NAME", ""),
        "USER": os.getenv("DB_USER", "postgres"),
        "PASSWORD": os.getenv("DB_PASSWORD", "postgres"),
        "HOST": os.getenv("DB_HOST", "localhost"),
        "PORT": os.getenv("DB_PORT", "5432"),
        "CONN_MAX_AGE": int(os.getenv("DB_CONN_MAX_AGE", "120")),
<<<<<<< HEAD
    }
}

=======
        "OPTIONS": {},
    }
}

db_sslmode = os.getenv("DB_SSLMODE", "").strip()
db_connect_timeout = os.getenv("DB_CONNECT_TIMEOUT", "").strip()
if db_sslmode:
    DATABASES["default"]["OPTIONS"]["sslmode"] = db_sslmode
if db_connect_timeout:
    DATABASES["default"]["OPTIONS"]["connect_timeout"] = int(db_connect_timeout)

>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
LANGUAGE_CODE = "fr-fr"
TIME_ZONE = "Africa/Algiers"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Dev only: allow browser-based frontend to call this service
CORS_ALLOW_ALL_ORIGINS = True
