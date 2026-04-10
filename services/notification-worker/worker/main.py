import json
import os
import time

import pika


RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
USER_REGISTERED_QUEUE = os.getenv("USER_REGISTERED_QUEUE", "user_registered")


def handle_message(ch, method, properties, body):
    try:
        payload = json.loads(body.decode("utf-8"))
    except Exception:
        payload = {"raw": body.decode("utf-8", errors="replace")}
    print(f"[notification-worker] received: {payload}")
    ch.basic_ack(delivery_tag=method.delivery_tag)


def main():
    retry_delay = int(os.getenv("WORKER_RETRY_DELAY_SECONDS", "5"))
    while True:
        try:
            connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
            channel = connection.channel()
            channel.queue_declare(queue=USER_REGISTERED_QUEUE, durable=True)
            channel.basic_qos(prefetch_count=1)
            channel.basic_consume(queue=USER_REGISTERED_QUEUE, on_message_callback=handle_message)
            print(f"Worker listening on {USER_REGISTERED_QUEUE} ({RABBITMQ_URL})")
            channel.start_consuming()
        except KeyboardInterrupt:
            raise
        except Exception as exc:
            print(f"[notification-worker] connection failed: {exc}. Retrying in {retry_delay}s...")
            time.sleep(retry_delay)


if __name__ == "__main__":
    main()
