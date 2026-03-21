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

        # 1. Gemini - Primary Powerhouse (discovery showed 2.x and 3.x models)
        if self.settings.GEMINI_API_KEY:
             for g_model in ["gemini/gemini-2.0-flash", "gemini/gemini-3-flash-preview", "gemini/gemini-1.5-pro"]:
                 available_llms.append(LLM(
                     model=g_model,
                     api_key=self.settings.GEMINI_API_KEY,
                     temperature=0.1
                 ))

        # 2. Groq - High reliability, high speed fallback
        if self.settings.GROQ_API_KEY:
             available_llms.append(LLM(
                 model="groq/llama-3.3-70b-versatile",
                 api_key=self.settings.GROQ_API_KEY,
                 temperature=0.1,
                 timeout=30
             ))

        # 3. OpenRouter Free - High Capacity Fallback (120B / 20B MoE)
        if self.settings.OPENROUTER_API_KEY:
             for or_model in ["openai/gpt-oss-120b:free", "openai/gpt-oss-20b:free", "meta-llama/llama-3.3-70b-instruct:free"]:
                 available_llms.append(LLM(
                     model=or_model,
                     api_key=self.settings.OPENROUTER_API_KEY,
                     temperature=0.1,
                     base_url="https://openrouter.ai/api/v1"
                 ))

        # 4. OpenAI - Robust secondary backup
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