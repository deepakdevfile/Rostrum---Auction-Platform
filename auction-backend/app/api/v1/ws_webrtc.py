
import uuid

import orjson
from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.api.deps import get_current_user_ws
from app.core.config import get_settings
from app.db.session import AsyncSessionLocal
from app.models.misc import ParticipantRole, WebRTCSession
from app.ws.connection_manager import webrtc_manager

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

@router.websocket("/ws/rooms/{room_id}/webrtc")
async def webrtc_socket(
    websocket: WebSocket,
    room_id: uuid.UUID,
    token: str = Query(...),
    role: ParticipantRole = Query(ParticipantRole.bidder),
):
    async with AsyncSessionLocal() as db:
        user = await get_current_user_ws(token, db)
    if user is None:
        await websocket.close(code=4401)
        return

    await webrtc_manager.connect(str(room_id), websocket)
    peer_id = str(user.id)

    async with AsyncSessionLocal() as db: 
        session_row = WebRTCSession(room_id=room_id, user_id=user.id, role=role)
        db.add(session_row)
        await db.commit()
        await db.refresh(session_row)

    await webrtc_manager.broadcast(
        str(room_id), {"type": "peer_joined", "from_peer": peer_id, "role": role.value}
    )

    try:
        while True:
            raw = await websocket.receive_text()
            try: 
                msg = orjson.loads(raw)
            except orjson.JSONDecodeError:
                continue
            msg["from_peer"] = peer_id
            await webrtc_manager.broadcast(str(room_id), msg)
    except WebSocketDisconnect:
        pass
    finally:
        webrtc_manager.disconnect(str(room_id), websocket)
        await webrtc_manager.broadcast(str(room_id), {"type": "peer_left", "from_peer": peer_id})
        async with AsyncSessionLocal() as db: 
            from sqlalchemy import func, select, update as sa_update

            await db.execute(
                sa_update(WebRTCSession)
                .where(
                    WebRTCSession.room_id == room_id,
                    WebRTCSession.user_id == user.id,
                    WebRTCSession.left_at.is_(None),
                )
                .values(left_at=func.now())
            )
            await db.commit()