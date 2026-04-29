from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
async def login():
    return {"msg": "login placeholder"}


@router.post("/register")
async def register():
    return {"msg": "register placeholder"}
