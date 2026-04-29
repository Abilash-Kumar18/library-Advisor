from pydantic import BaseSettings


class Settings(BaseSettings):
    hf_token: str = ""
    db_url: str = "sqlite:///./test.db"

    class Config:
        env_file = ".env"


settings = Settings()
