import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator, model_validator, ValidationInfo

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

    # --- LLM Provider Keys (all optional, at least one required) ---
    OPENAI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    OPENROUTER_API_KEY: Optional[str] = None

    # --- Model Selection ---
    MODEL: str = "groq/llama-3.3-70b-versatile"
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    OPENROUTER_MODEL: str = "openai/gpt-4o-mini"

    # --- Finance & News APIs ---
    FINNHUB_API_KEY: Optional[str] = None
    NEWS_API_KEY: Optional[str] = None
    GNEWS_API_KEY: Optional[str] = None
    TAVILY_API_KEY: Optional[str] = None
    GOOGLE_TRANSLATE_API_KEY: Optional[str] = None

    # --- Supabase ---
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str

    # --- RAG & Search ---
    RAG_VECTOR_DB_PATH: str = "storage/vector_indices"

    # --- Validation ---
    @field_validator("SUPABASE_URL", "SUPABASE_ANON_KEY")
    @classmethod
    def check_supabase_keys(cls, v: str, info: ValidationInfo) -> str:
        if not v or v.strip() == "":
            raise ValueError(f"Essential Supabase key missing: {info.field_name}")
        return v

    @model_validator(mode="after")
    def check_at_least_one_llm_key(self) -> "Settings":
        keys = [self.OPENAI_API_KEY, self.GROQ_API_KEY, self.GEMINI_API_KEY, self.OPENROUTER_API_KEY]
        if not any(k for k in keys if k and k.strip()):
            print("[Config] WARNING: No LLM API keys detected. AI features will be unavailable.")
        else:
            active = []
            if self.GROQ_API_KEY: active.append("Groq")
            if self.GEMINI_API_KEY: active.append("Gemini")
            if self.OPENAI_API_KEY: active.append("OpenAI")
            print(f"[Config] LLM providers active: {', '.join(active)}")
        return self

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
    if os.getenv("APP_ENV") == "production":
        import sys
        sys.exit(1)
    settings = None
