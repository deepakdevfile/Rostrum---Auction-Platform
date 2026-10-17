
import asyncio
import logging
from collections import defaultdict

import orjson
from fastapi import WebSocket
from redis.asyncio import Redis

from app.core.config import get_settings


settings = get_settings()
logger = logging.getLogger("ws.manager")

class RoomConnectionManager:
    def __init__(self, channel_prefix: str) -> None:
        self._prefix = channel_prefix
        self._local: dict[str, set[WebSocket]] = defaultdict(set)
        self._redis: Redis | None = None
        self._listener_task: asyncio.Task | None = None

    async def startup(self, redis_url: str) -> None:
        self._redis = Redis.from_url(redis_url, decode_response = True)
        self._listener_task = asyncio.create_task(self._listen())
        logger.info("connection manager subscriber to %s* on redis", self._prefix)

    async def shutdown(self) -> None:
        if self._listener_task:
            self._listener_task.cancel()
        if self._redis:
            await self._redis.close()

    async def _listen(self) -> None:
        assert self._redis is not None
        pubsub = self._redis.pubsub()
        await pubsub.psubscribe(f"{self._prefix}*")
        async for message in pubsub.listen():
            if message["type"] != "pmessage":
                continue
            channel: str = message["channel"]
            room_id = channel.removeprefix(self._prefix)
            sockets = self._local.get(room_id)
            if not sockets:
                continue
            data = message["data"]
            dead: list[WebSocket] = []
            for ws in sockets: 
                try: 
                    await ws.send_text(data)
                except Exception:
                    dead.append(ws)
            for ws in dead: 
                sockets.discard(ws)

    async def connect(self, room_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self._local[room_id].add(websocket)

    def disconnect(self, room_id: str, websocket: WebSocket) -> None:
        self._local[room_id].discard(websocket)
        if not self._local[room_id]:
            del self._local[room_id]

    async def broadcast(self, room_id: str, payload: dict) -> None: 
        assert self._redis is not None
        channel = f"{self._prefix}{room_id}"
        await self._redis.publish(channel, orjson.dumps(payload).decode())

    def local_connection_count(self, room_id: str) -> int:
        return len(self._local.get(room_id, ()))


webrtc_manager = RoomConnectionManager(settings.REDIS_WEBRTC_CHANNEL_PREFIX)