import logging
from crewai import LLM
from app.core.config import settings
from app.services.failover_llm import FailoverLLM

logger = logging.getLogger(__name__)

class LLMRouter:
    def __init__(self):
        self.settings = settings

    def get_router(self):
        """
        Dynamically builds a FailoverLLM chain based on available keys.
        Priority: Groq > Gemini > OpenAI
        """
        available_llms = []

        # 1. Groq - High reliability, high speed
        if self.settings.GROQ_API_KEY:
             available_llms.append(LLM(
                 model="groq/llama-3.3-70b-versatile",
                 api_key=self.settings.GROQ_API_KEY,
                 temperature=0.1,
                 timeout=30
             ))

        # 2. Gemini - Efficient fallback
        if self.settings.GEMINI_API_KEY:
             available_llms.append(LLM(
                 model="gemini/gemini-2.0-flash",
                 api_key=self.settings.GEMINI_API_KEY,
                 temperature=0.1
             ))

        # 3. OpenAI - Robust backup
        if self.settings.OPENAI_API_KEY:
             available_llms.append(LLM(
                 model="openai/gpt-4o-mini",
                 api_key=self.settings.OPENAI_API_KEY,
                 temperature=0.1
             ))

        # 4. OpenRouter - The ultimate fallback (has many models)
        if self.settings.OPENROUTER_API_KEY:
             available_llms.append(LLM(
                 model=self.settings.OPENROUTER_MODEL or "openai/gpt-4o-mini",
                 api_key=self.settings.OPENROUTER_API_KEY,
                 temperature=0.1,
                 base_url="https://openrouter.ai/api/v1"
             ))

        if not available_llms:
             # If no keys, return a dummy that will fail gracefully or use local
             logger.critical("[Router] No LLM keys found. AI features will fail.")
             raise ValueError("CRITICAL: No LLM API keys configured.")

        # Return a FailoverLLM instance
        return FailoverLLM(
            primary=available_llms[0],
            fallbacks=available_llms[1:]
        )

llm_router = LLMRouter()