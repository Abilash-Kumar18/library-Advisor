from fastapi import APIRouter

router = APIRouter(prefix="/qa", tags=["qa"])


@router.post("/ask")
async def ask_question():
    return {"msg": "qa placeholder"}
