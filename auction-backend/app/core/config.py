from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    DATABASE_URL: str

    REDIS_URL: str
    REDIS_ROOM_CHANNEL_PREFIX: str = "room:"
    REDIS_TICKER_CHANNEL_PREFIX: str = "ticker:"
    REDIS_WEBRTC_CHANNEL_PREFIX: str = "webrtc:"


    STUN_SERVERS: list[str] = ["stun:stun.l.google.com:19302"]
    TURN_URL: str | None = None
    TURN_USERNAME: str | None = None
    TURN_CREDENTIAL: str | None = None

    CORS_ORIGINS: list[str]


@lru_cache 
def get_settings() -> Settings:
    return Settings()