FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "set -e; until python -c \"import os, socket; s=socket.create_connection((os.getenv('DB_HOST','postgres'), int(os.getenv('DB_PORT','5432'))),2); s.close()\"; do sleep 1; done; python manage.py migrate; (python -c \"import os, json, urllib.request; addr=os.getenv('CONSUL_HTTP_ADDR','http://consul:8500'); name=os.getenv('SERVICE_NAME','listing-service'); host=os.getenv('SERVICE_HOST','listing-service'); port=int(os.getenv('SERVICE_PORT','8000')); tags=['traefik.enable=true','traefik.http.routers.listing.rule=PathPrefix(\\\"/api/listing\\\")','traefik.http.routers.listing.entrypoints=web','traefik.http.middlewares.listing-strip.stripprefix.prefixes=/api/listing','traefik.http.middlewares.cors.headers.accessControlAllowOriginList=http://localhost:5173,http://localhost:5174,http://localhost:5175','traefik.http.middlewares.cors.headers.accessControlAllowMethods=GET,POST,PUT,PATCH,DELETE,OPTIONS','traefik.http.middlewares.cors.headers.accessControlAllowHeaders=Authorization,Content-Type','traefik.http.middlewares.cors.headers.accessControlAllowCredentials=true','traefik.http.routers.listing.middlewares=listing-strip,cors','traefik.http.services.listing.loadbalancer.server.port=8000']; payload={'Name': name, 'Address': host, 'Port': port, 'Tags': tags, 'Check': {'HTTP': f'http://{host}:{port}/health/', 'Interval': '10s'}}; req=urllib.request.Request(addr + '/v1/agent/service/register', data=json.dumps(payload).encode('utf-8'), headers={'Content-Type':'application/json'}, method='PUT'); urllib.request.urlopen(req)\") || true; python manage.py runserver 0.0.0.0:8000"]
