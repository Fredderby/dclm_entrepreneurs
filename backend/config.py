from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DB_TYPE: str = "mysql"
    DB_HOST: str = "mysql-202931-0.cloudclusters.net"
    DB_PORT: str = "19944"
    DB_USER: str = "admin"
    DB_PASSWORD: str = "7L8LDRQa"
    DB_NAME: str = "entrepreneur"

    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "dclm2026"
    JWT_SECRET: str = "dclm-ghana-entrepreneurship-secret-key-2026"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 24

    CORS_ORIGINS: List[str] = ["http://127.0.0.1:3001", "http://localhost:3001"]

    class Config:
        extra = "ignore"

settings = Settings()
