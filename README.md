# AOS Projet - Plateforme Immobiliere (Microservices)

Structure initiale du projet selon les contraintes WAMS.

- Services Django REST: `auth-service`, `listing-service`, `account-service`, `admin-validation-service`, `location-service`
- Worker asynchrone: `notification-worker`
- UI web: `ui/web`
- UI admin: `ui/admin`
- Infra: `traefik`, `consul`, `rabbitmq`
<<<<<<< HEAD
- Cache distribue: `redis`
=======
<<<<<<< HEAD
- Cache distribue: `redis`
=======
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
>>>>>>> 0a3aee41df08352ed85b07b5fe48d7f19cfc7a08

## Quick Start (Docker)

```bash
docker compose down
docker compose up --build
```

### URLs utiles

- Traefik (dashboard): `http://localhost:8081`
- Consul (UI): `http://localhost:8500/ui`
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 0a3aee41df08352ed85b07b5fe48d7f19cfc7a08
- Redis: `localhost:6379`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3000`
  - Default login: `admin / admin`
<<<<<<< HEAD
=======
=======
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
>>>>>>> 0a3aee41df08352ed85b07b5fe48d7f19cfc7a08
- UI web: `http://localhost:5173`
- UI admin: `http://localhost:5174`

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

## Traefik Dashboard (documentation)

Dans la presentation finale, inclure une capture de:
- `http://localhost:8081` montrant Routers/Services/Middlewares en succes.

## Notes

- Service Discovery: Consul Catalog alimente Traefik (sans labels Docker).
- Health checks: `/health/` sur chaque service.

Consultez `docs/folders_en.md` pour un apercu de la structure.
