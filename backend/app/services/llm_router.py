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
        Priority: Groq (primary) > Gemini > OpenRouter > OpenAI
        Groq is fastest and has the most generous free tier — always primary.
        """
        available_llms = []

        # 1. Groq — PRIMARY: Fastest, most generous free tier, zero quota issues
        if self.settings.GROQ_API_KEY:
            available_llms.append(LLM(
                model="groq/llama-3.3-70b-versatile",
                api_key=self.settings.GROQ_API_KEY,
                temperature=0.1,
                timeout=30
            ))
            # Secondary Groq model for fallback within Groq
            available_llms.append(LLM(
                model="groq/llama-3.1-70b-versatile",
                api_key=self.settings.GROQ_API_KEY,
                temperature=0.1,
                timeout=30
            ))

        # 2. Gemini — SECONDARY: Powerful but strict free-tier quotas
        if self.settings.GEMINI_API_KEY:
            available_llms.append(LLM(
                model="gemini/gemini-2.0-flash",
                api_key=self.settings.GEMINI_API_KEY,
                temperature=0.1
            ))
            available_llms.append(LLM(
                model="gemini/gemini-1.5-flash",
                api_key=self.settings.GEMINI_API_KEY,
                temperature=0.1
            ))

        # 3. OpenRouter Free — High Capacity Fallback (120B / 70B)
        if self.settings.OPENROUTER_API_KEY:
            for or_model in [
                "meta-llama/llama-3.3-70b-instruct:free",
                "microsoft/phi-4-reasoning:free",
                "google/gemini-2.0-flash-exp:free"
            ]:
                available_llms.append(LLM(
                    model=or_model,
                    api_key=self.settings.OPENROUTER_API_KEY,
                    temperature=0.1,
                    base_url="https://openrouter.ai/api/v1"
                ))

        # 4. OpenAI — Robust paid backup
        if self.settings.OPENAI_API_KEY:
            available_llms.append(LLM(
                model="openai/gpt-4o-mini",
                api_key=self.settings.OPENAI_API_KEY,
                temperature=0.1
            ))

        if not available_llms:
            logger.critical("[Router] No LLM keys found. AI features will fail.")
            raise ValueError("CRITICAL: No LLM API keys configured.")

        primary = available_llms[0]
        fallbacks = available_llms[1:]
        logger.info(f"[Router] Primary: {primary.model} | Fallbacks: {len(fallbacks)}")
        return FailoverLLM(primary=primary, fallbacks=fallbacks)

llm_router = LLMRouter()