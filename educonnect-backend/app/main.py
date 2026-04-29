from fastapi import FastAPI
from app.db.session import connect_to_mongo, close_mongo_connection
from app.api import projects, recommend, qa, auth

app = FastAPI(title="EduConnect Backend")


@app.on_event("startup")
async def startup():
    await connect_to_mongo()


@app.on_event("shutdown")
async def shutdown():
    await close_mongo_connection()


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(projects.router, prefix="/projects")
app.include_router(recommend.router, prefix="/recommend")
app.include_router(qa.router, prefix="/qa")