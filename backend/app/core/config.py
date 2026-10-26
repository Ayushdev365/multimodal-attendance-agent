import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Multimodal Attendance & Engagement Agent"
    APP_ENV: str = "development"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DATABASE_URL: str = "sqlite:///./data/attendance.db"
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    LOG_LEVEL: str = "INFO"
    MODEL_DIR: str = "./models"
    ENABLE_AUDIO_PROCESSING: bool = True
    ENABLE_BIOMETRIC_IDENTIFICATION: bool = False
    DEFAULT_PRESENCE_THRESHOLD_SECONDS: int = 60

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
