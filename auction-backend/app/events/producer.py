import logging

import orjson
from aiokafka import AIOKafkaProducer

from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger("kafka.producer")

_producer: AIOKafkaProducer | None = None

async def get_producer() -> AIOKafkaProducer:
    global _producer
    if _producer is None:
        _producer = AIOKafkaProducer(
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
            value_serializer=lambda v: orjson.dumps(v),
            key_serializer=lambda k: k.encode() if isinstance(k, str) else k,
            acks= "all",
            enable_idempotence=True,
        )
        await _producer.start()
    return _producer

async def close_producer() -> None:
    global _producer
    if _producer is not None:
        await _producer.stop()
        _producer = None

