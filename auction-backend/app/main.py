import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.deps import get_redis
from app.api.v1 import api_router, ws_router
from app.core.config import get_settings
from app.events.producer import close_producer
from app.services import room_lifecycle
from app.ws.connection_manager import webrtc_manager, room_manager

logging.basicConfig(level=logging.INFO)
settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await room_manager.startup(settings.REDIS_URL)
    await webrtc_manager.startup(settings.REDIS_URL)

    redis = get_redis()
    lifecycle_task = asyncio.create_task(room_lifecycle.run_forever(redis))

    yield

    lifecycle_task.cancel()
    await room_manager.shutdown()
    await webrtc_manager.shutdown()
    await close_producer()

app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
)

app.include_router(api_router)
app.include_router(ws_router)

@app.get("/")
def main():
    return {"message": "Hello World"}
