from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "ET AI Trader X"
    API_V1_STR: str = "/api/v1"
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
    NEWS_API_KEY: str = os.getenv("NEWS_API_KEY")
    MODEL: str = os.getenv("MODEL", "gpt-4-turbo")

settings = Settings()
