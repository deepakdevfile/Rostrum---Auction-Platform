from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    DATABASE_URL: str

    CORS_ORIGINS: list[str]


@lru_cache 
def get_settings() -> Settings:
    return Settings()