import os
import logging
from app.core.config import settings
from crewai import LLM

logger = logging.getLogger(__name__)

class LLMRouter:
    def __init__(self):
        self.settings = settings

    def get_router(self):
        """
        Hardened Router (Senior Engineer Implementation)
        Priority: Groq (Confirmed active) > Gemini > OpenAI
        """
        # 1. Groq - High reliability, currently active quota
        if self.settings.GROQ_API_KEY:
             logger.info("[Router] Routing to GROQ (llama-3.3-70b-versatile)")
             return LLM(
                 model="groq/llama-3.3-70b-versatile",
                 api_key=self.settings.GROQ_API_KEY,
                 temperature=0.1,
                 timeout=30
             )

        # 2. Gemini - Fallback (Likely exhausted today)
        if self.settings.GEMINI_API_KEY:
             logger.warning("[Router] GROQ key missing, falling back to Gemini (Expected 429)")
             return LLM(
                 model="gemini/gemini-2.0-flash",
                 api_key=self.settings.GEMINI_API_KEY,
                 temperature=0.1
             )

        # 3. OpenAI - Last resort (Confirmed 429)
        if self.settings.OPENAI_API_KEY:
             logger.error("[Router] Primary providers failed, attempting OpenAI (Likely 429)")
             return LLM(
                 model="openai/gpt-4o-mini",
                 api_key=self.settings.OPENAI_API_KEY,
                 temperature=0.1
             )

        raise ValueError("CRITICAL: All LLM Providers exhausted or missing API keys.")

llm_router = LLMRouter()