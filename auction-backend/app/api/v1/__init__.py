from fastapi import APIRouter

from app.api.v1 import auth, rooms, ws_webrtc, ws_bids, sse

api_router = APIRouter(prefix = "/api/v1")
api_router.include_router(auth.router)
api_router.include_router(rooms.router)
api_router.include_router(sse.router)

ws_router = APIRouter()
ws_router.include_router(ws_bids.router)
ws_router.include_router(ws_webrtc.router)