from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    DATABASE_URL: str

    STUN_SERVERS: list[str] = ["stun:stun.l.google.com:19302"]
    TURN_URL: str | None = None
    TURN_USERNAME: str | None = None
    TURN_CREDENTIAL: str | None = None

    CORS_ORIGINS: list[str]


@lru_cache 
def get_settings() -> Settings:
    return Settings()