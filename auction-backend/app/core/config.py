from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str
    ENV: str = "development"
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    DATABASE_URL: str

    REDIS_URL: str
    REDIS_ROOM_CHANNEL_PREFIX: str = "room:"
    REDIS_TICKER_CHANNEL_PREFIX: str = "ticker:"
    REDIS_WEBRTC_CHANNEL_PREFIX: str = "webrtc:"

    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:9092"
    KAFKA_TOPIC_BID_PLACED: str = "bid.placed"
    KAFKA_TOPIC_AUCTION_WON: str = "auction.won"
    KAFKA_TOPIC_PAYMENT_FAILED: str = "payment.failed"
    KAFKA_CONSUMER_GROUP_ORDERS: str = "order-service"
    KAFKA_CONSUMER_GROUP_NOTIFICATIONS: str = "notification-service"
    KAFKA_CONSUMER_GROUP_ANALYTICS: str = "analytics-service"

    STUN_SERVERS: list[str] = ["stun:stun.l.google.com:19302"]
    TURN_URL: str | None = None
    TURN_USERNAME: str | None = None
    TURN_CREDENTIAL: str | None = None

    CORS_ORIGINS: list[str]


@lru_cache 
def get_settings() -> Settings:
    return Settings()