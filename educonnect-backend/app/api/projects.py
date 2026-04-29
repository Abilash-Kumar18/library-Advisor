from fastapi import APIRouter

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("/create")
async def create_project():
    return {"msg": "create project placeholder"}


@router.post("/join")
async def join_project():
    return {"msg": "join project placeholder"}
