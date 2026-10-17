
from fastapi import APIRouter

from app.core.config import get_settings

router = APIRouter()
settings = get_settings()

@router.get("/rtc/ice-config")
async def ice_config():
    servers = [{"urls": settings.STUN_SERVERS}]
    if settings.TURN_URL:
        servers.append(
            {
                "urls": [settings.TURN_URL],
                "username": settings.TURN_USERNAME,
                "credential": settings.TURN_CREDENTIAL,
            }
        )
    return { "iceServers": servers }