from fastapi import APIRouter


router = APIRouter(prefix = "/rooms", tags = ["rooms"])

@router.post("")
async def create_room() -> str:
    return "Okay, I can listen, send the payload"