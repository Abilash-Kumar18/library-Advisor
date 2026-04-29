from fastapi import FastAPI


def create_app() -> FastAPI:
    """Create and return the FastAPI application."""
    app = FastAPI(title="EduConnect Backend")
    return app


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:create_app", host="0.0.0.0", port=8000, reload=True)
