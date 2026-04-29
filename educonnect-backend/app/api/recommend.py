from fastapi import APIRouter

router = APIRouter(prefix="/recommend", tags=["recommend"])


@router.get("/match")
async def match():
    return {"msg": "recommend placeholder"}
