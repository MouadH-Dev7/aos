# Folder Structure (English)

This file briefly explains the role of each folder and its main contents.

## Root
- `services/` : Microservices (Back-end). Each service is isolated with its own files.
- `ui/` : User interface (Front-end).
- `infra/` : Infrastructure configuration (Traefik, Consul, RabbitMQ).
- `docs/` : Project documentation (folder structure overview).

## services/
- `auth-service/` : Authentication service for tokens and roles.
  - `auth_service/` : Service application code.
  - `config/` : Django settings (settings/urls/wsgi).
  - `requirements.txt` : Python dependencies.
  - `.env.example` : Environment variables example.
  - `manage.py` : Django management entrypoint.

- `listing-service/` : Real?estate listings service (CRUD + search/filter).
  - `listing_service/` : Service application code.
  - `config/` : Django settings.
  - `requirements.txt` : Python dependencies.
  - `.env.example` : Environment variables example.
  - `manage.py` : Django management entrypoint.

- `account-service/` : Users, agencies, and promoters accounts service.
  - `account_service/` : Service application code.
  - `config/` : Django settings.
  - `requirements.txt` : Python dependencies.
  - `.env.example` : Environment variables example.
  - `manage.py` : Django management entrypoint.

- `admin-validation-service/` : Administrative review/approval service.
  - `admin_validation_service/` : Service application code.
  - `config/` : Django settings.
  - `requirements.txt` : Python dependencies.
  - `.env.example` : Environment variables example.
  - `manage.py` : Django management entrypoint.

- `notification-worker/` : Async worker for message processing (RabbitMQ).
  - `worker/` : Worker code.
  - `requirements.txt` : Python dependencies.
  - `.env.example` : Environment variables example.

## ui/
- `web/` : Web client that consumes the APIs.

## infra/
- `traefik/` : Reverse proxy and routing configuration.
- `consul/` : Service discovery configuration.
- `rabbitmq/` : Message broker configuration.

## docs/
- `folders_en.md` : This English file.
