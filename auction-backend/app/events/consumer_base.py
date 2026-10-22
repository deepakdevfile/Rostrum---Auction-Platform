import orjson
from aiokafka import AIOKafkaConsumer

from app.core.config import get_settings

settings = get_settings()

def build_consumer(topics: list[str], group_id: str) -> AIOKafkaConsumer:
    return AIOKafkaConsumer(
        *topics,
        bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
        group_id=group_id,
        value_deserializer=lambda v: orjson.loads(v),
        key_deserializer=lambda k: k.decode() if k else None,
        enable_auto_commit=False,
        auto_offset_reset="earliest",
    )
