import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator, ValidationInfo

class Settings(BaseSettings):
    # --- Project Metadata ---
    PROJECT_NAME: str = "ET AI Trader X"
    API_V1_STR: str = "/api/v1"
    APP_ENV: str = "development"  # development, production, test
    
    # --- Infrastructure ---
    LOG_LEVEL: str = "INFO"
    DEFAULT_TIMEZONE: str = "Asia/Kolkata"
    DEFAULT_MARKET_REGION: str = "IN"
    CORS_ORIGINS: str = "*"
    REDIS_URL: Optional[str] = None

    @property
    def cors_origins_list(self) -> List[str]:
        if not self.CORS_ORIGINS or self.CORS_ORIGINS == "*":
            return ["*"]
        return [i.strip() for i in self.CORS_ORIGINS.split(",")]

    # --- LLM Provider Keys (Fail-Fast for OpenAI) ---
    OPENAI_API_KEY: str
    GROQ_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    OPENROUTER_API_KEY: Optional[str] = None
    
    # --- Model Selection ---
    MODEL: str = "gpt-4o"  # Default high-performance model
    GROQ_MODEL: str = "llama3-70b-8192"
    OPENROUTER_MODEL: str = "anthropic/claude-3-opus"

    # --- Finance & News APIs ---
    FINNHUB_API_KEY: Optional[str] = None
    NEWS_API_KEY: Optional[str] = None
    GNEWS_API_KEY: Optional[str] = None
    TAVILY_API_KEY: Optional[str] = None

    # --- Supabase ---
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str

    # --- RAG & Search ---
    RAG_VECTOR_DB_PATH: str = "storage/vector_indices"

    # --- Validation ---
    @field_validator("OPENAI_API_KEY", "SUPABASE_URL", "SUPABASE_ANON_KEY")
    @classmethod
    def check_required_keys(cls, v: str, info: ValidationInfo) -> str:
        if not v or v.strip() == "":
            raise ValueError(f"Essential configuration key missing: {info.field_name}")
        return v

    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8", 
        extra="ignore",
        case_sensitive=True
    )

try:
    settings = Settings()
    print(f"[Config] Layer loaded for environment: {settings.APP_ENV}")
except Exception as e:
    print(f"[Config] CRITICAL ERROR DURING STARTUP: {e}")
    # In production, we want to exit early
    if os.getenv("APP_ENV") == "production":
        import sys
        sys.exit(1)
    # For dev, we still create a placeholder to avoid import errors
    # but the app will likely fail during tool usage.
    settings = None
