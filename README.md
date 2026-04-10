# AOS Projet - Plateforme Immobiliere (Microservices)

Structure initiale du projet selon les contraintes WAMS.

- Services Django REST: `auth-service`, `listing-service`, `account-service`, `admin-validation-service`, `location-service`
- Worker asynchrone local: `notification-worker`
- UI web: `ui/web`
- UI admin: `ui/admin`
- Infra: `traefik`, `consul`, `rabbitmq`
- Cache distribue: `redis`

## Deployed Render URLs

### Backend services

- `auth-service`: `https://auth-service-56qw.onrender.com`
- `account-service`: `https://account-service-jdqy.onrender.com`
- `location-service`: `https://location-service-vmm4.onrender.com`
- `listing-service`: `https://listing-service-9ma6.onrender.com`
- `admin-validation-service`: `https://admin-validation-service.onrender.com`

### Frontend apps

- `UI admin`: `https://admin-ga8i.onrender.com`
- `UI web`: `https://web-bm0c.onrender.com`

## Quick Start (Docker)

```bash
docker compose down
docker compose up --build
```

### URLs utiles en local

- Traefik (dashboard): `http://localhost:8081`
- Consul (UI): `http://localhost:8500/ui`
- Redis: `localhost:6379`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3000`
- UI web: `http://localhost:5173`
- UI admin: `http://localhost:5174`

Default Grafana login:

- `admin / admin`

### Verification des routes via Traefik

PowerShell:

```powershell
Invoke-WebRequest http://localhost:8080/api/auth/health/ -UseBasicParsing
Invoke-WebRequest http://localhost:8080/api/account/health/ -UseBasicParsing
Invoke-WebRequest http://localhost:8080/api/location/health/ -UseBasicParsing
Invoke-WebRequest http://localhost:8080/api/listing/health/ -UseBasicParsing
Invoke-WebRequest http://localhost:8080/api/admin/health/ -UseBasicParsing
```

curl:

```bash
curl http://localhost:8080/api/auth/health/
curl http://localhost:8080/api/account/health/
curl http://localhost:8080/api/location/health/
curl http://localhost:8080/api/listing/health/
curl http://localhost:8080/api/admin/health/
```

## Notes

- Service Discovery local: Consul Catalog alimente Traefik
- Health checks: `/health/` sur chaque service
- Render deployment is handled service by service without `render.yaml`

Consultez `docs/folders_en.md` pour un apercu de la structure.
