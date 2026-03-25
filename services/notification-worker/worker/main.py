<<<<<<< HEAD
import json
import os

import pika


=======
import os
import json
import pika

>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
USER_REGISTERED_QUEUE = os.getenv("USER_REGISTERED_QUEUE", "user_registered")


def handle_message(ch, method, properties, body):
    try:
        payload = json.loads(body.decode("utf-8"))
    except Exception:
        payload = {"raw": body.decode("utf-8", errors="replace")}
<<<<<<< HEAD
=======

>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
    print(f"[notification-worker] received: {payload}")
    ch.basic_ack(delivery_tag=method.delivery_tag)


<<<<<<< HEAD
def main():
=======
if __name__ == "__main__":
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
    connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
    channel = connection.channel()
    channel.queue_declare(queue=USER_REGISTERED_QUEUE, durable=True)
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=USER_REGISTERED_QUEUE, on_message_callback=handle_message)
    print(f"Worker listening on {USER_REGISTERED_QUEUE} ({RABBITMQ_URL})")
    channel.start_consuming()
<<<<<<< HEAD


if __name__ == "__main__":
    main()
=======
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
