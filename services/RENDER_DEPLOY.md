# Render Deployment Notes

This services folder is now prepared around Render-style runtime assumptions:

- Django web services run with `gunicorn`
- startup no longer depends on `Consul` or `Traefik`
- configuration is driven by Render environment variables
- PostgreSQL is expected through `DATABASE_URL`
- Redis is expected through `REDIS_URL`
- RabbitMQ is expected through an external `RABBITMQ_URL`

## Included blueprint

Use the repo root blueprint:

- [render.yaml](../render.yaml)

It defines:

- `auth-service`
- `account-service`
- `location-service`
- `listing-service`
- `admin-validation-service`
- `notification-worker`
- managed PostgreSQL databases
- one managed Key Value/Redis-compatible cache

## External dependency still required

Render does not provision RabbitMQ in the same first-party way as PostgreSQL/Key Value in this blueprint.

You still need an external RabbitMQ provider and must set:

- `RABBITMQ_URL`

for:

- `auth-service`
- `notification-worker`

## Minimum env variables per Django service

- `DJANGO_SECRET_KEY`
- `DATABASE_URL`
- `ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`
- `CSRF_TRUSTED_ORIGINS`

Optional:

- `DJANGO_DEBUG=false`
- `DB_CONN_MAX_AGE=120`
- `GUNICORN_WORKERS=2`
- `GUNICORN_TIMEOUT=120`

## Service-specific extras

### auth-service

- `RABBITMQ_URL`
- `USER_REGISTERED_QUEUE`

### location-service

- `REDIS_URL`

### listing-service

- `REDIS_URL`
- `AUTH_BASE_URLS`

### admin-validation-service

- `LISTING_BASE_URLS`
- `AUTH_BASE_URLS`

### notification-worker

- `RABBITMQ_URL`
- `USER_REGISTERED_QUEUE`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `SMTP_FROM`

## Local development vs Render

`docker-compose.yml` is still useful for local development and still includes local infra like Traefik/Consul.
That does not block Render deployment, because Render uses the new service Dockerfiles and `render.yaml`.
