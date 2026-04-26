# Render Deployment Notes

Deploy only these Django services on Render as standalone `Web Service` deployments:

- `auth-service`
- `account-service`
- `location-service`
- `listing-service`
- `admin-validation-service`

Use these root directories:

- `services/auth-service`
- `services/account-service`
- `services/location-service`
- `services/listing-service`
- `services/admin-validation-service`

## Published service URLs

- `auth-service`: `https://auth-service-56qw.onrender.com`
- `account-service`: `https://account-service-jdqy.onrender.com`
- `location-service`: `https://location-service-vmm4.onrender.com`
- `listing-service`: `https://listing-service-9ma6.onrender.com`
- `admin-validation-service`: `https://admin-validation-service.onrender.com`

## Published frontend URLs

- `admin UI`: `https://admin-ga8i.onrender.com`
- `web UI`: `https://web-bm0c.onrender.com`

## Shared Django Environment Variables

Required:

- `DJANGO_SECRET_KEY`
- `DATABASE_URL`
- `ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`
- `CSRF_TRUSTED_ORIGINS`

Recommended values for origins:

- `CORS_ALLOWED_ORIGINS=https://web-bm0c.onrender.com,https://admin-ga8i.onrender.com`
- `CSRF_TRUSTED_ORIGINS=https://web-bm0c.onrender.com,https://admin-ga8i.onrender.com,https://*.onrender.com`

Optional:

- `DJANGO_DEBUG=false`
- `CORS_ALLOW_ALL_ORIGINS=false`
- `DB_CONN_MAX_AGE=120`
- `DB_SSLMODE=require` when using an external PostgreSQL URL
- `DB_SSLMODE=disable` when using a private/internal PostgreSQL URL that does not support SSL
- `GUNICORN_WORKERS=2`
- `GUNICORN_TIMEOUT=120`

## Service-Specific Variables

### auth-service

- `RABBITMQ_URL`
- `USER_REGISTERED_QUEUE=user_registered`

### location-service

- `REDIS_URL`

### listing-service

- `REDIS_URL`
- `AUTH_BASE_URLS=https://auth-service-56qw.onrender.com`

### admin-validation-service

- `LISTING_BASE_URLS=https://listing-service-9ma6.onrender.com`
- `AUTH_BASE_URLS=https://auth-service-56qw.onrender.com`

## Notes

- `notification-worker` is intentionally not part of this Render deployment plan
- Django services start with `gunicorn` from each service `Dockerfile`
- Database configuration supports `DATABASE_URL`
- If Render logs show `SSL connection has been closed unexpectedly`, set `DB_SSLMODE` explicitly instead of relying on the driver default
- `render.yaml` is not used
