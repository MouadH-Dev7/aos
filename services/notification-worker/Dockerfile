FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["sh", "-c", "until python -c \"import os, socket; s=socket.create_connection((os.getenv('RABBITMQ_HOST','rabbitmq'), int(os.getenv('RABBITMQ_PORT','5672'))),2); s.close()\"; do sleep 1; done && python worker/main.py"]
