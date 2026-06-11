from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DB_TYPE: str = "mysql"
    DB_HOST: str = "mysql-202931-0.cloudclusters.net"
    DB_PORT: str = "19944"
    DB_USER: str = "admin"
    DB_PASSWORD: str = "7L8LDRQa"
    DB_NAME: str = "entrepreneur"

    CORS_ORIGINS: List[str] = ["http://127.0.0.1:3001", "http://localhost:3001"]

    class Config:
        extra = "ignore"

settings = Settings()