try:
    from pydantic_settings import BaseSettings
except Exception:
    try:
        from pydantic import BaseSettings
    except Exception:
        raise


class Settings(BaseSettings):
    PROJECT_NAME: str
    MONGODB_URL: str
    DATABASE_NAME: str
    SECRET_KEY: str
    ALGORITHM: str
    HF_TOKEN: str
    
    class Config:
        env_file = ".env"

settings = Settings()