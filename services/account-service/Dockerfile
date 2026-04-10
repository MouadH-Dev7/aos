FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

<<<<<<< HEAD
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers ${GUNICORN_WORKERS:-2} --timeout ${GUNICORN_TIMEOUT:-120}"]
=======
CMD ["sh", "-c", "set -e; until python -c \"import os, socket; s=socket.create_connection((os.getenv('DB_HOST','postgres'), int(os.getenv('DB_PORT','5432'))),2); s.close()\"; do sleep 1; done; python manage.py migrate; (python -c \"import os, json, urllib.request; addr=os.getenv('CONSUL_HTTP_ADDR','http://consul:8500'); name=os.getenv('SERVICE_NAME','account-service'); host=os.getenv('SERVICE_HOST','account-service'); port=int(os.getenv('SERVICE_PORT','8000')); tags=['traefik.enable=true','traefik.http.routers.account.rule=PathPrefix(\\\"/api/account\\\")','traefik.http.routers.account.entrypoints=web','traefik.http.middlewares.account-strip.stripprefix.prefixes=/api/account','traefik.http.middlewares.cors.headers.accessControlAllowOriginList=http://localhost:5173,http://localhost:5174,http://localhost:5175','traefik.http.middlewares.cors.headers.accessControlAllowMethods=GET,POST,PUT,PATCH,DELETE,OPTIONS','traefik.http.middlewares.cors.headers.accessControlAllowHeaders=Authorization,Content-Type','traefik.http.middlewares.cors.headers.accessControlAllowCredentials=true','traefik.http.routers.account.middlewares=account-strip,cors','traefik.http.services.account.loadbalancer.server.port=8000']; payload={'Name': name, 'Address': host, 'Port': port, 'Tags': tags, 'Check': {'HTTP': f'http://{host}:{port}/health/', 'Interval': '10s'}}; req=urllib.request.Request(addr + '/v1/agent/service/register', data=json.dumps(payload).encode('utf-8'), headers={'Content-Type':'application/json'}, method='PUT'); urllib.request.urlopen(req)\") || true; python manage.py runserver 0.0.0.0:8000"]
>>>>>>> 0a3aee41df08352ed85b07b5fe48d7f19cfc7a08
