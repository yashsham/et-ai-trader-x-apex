import logging
import time
from app.core.config import settings

logger = logging.getLogger(__name__)

class LLMRouter:
    def __init__(self):
        self.settings = settings

    def get_analysis_model(self) -> str:
        """Returns the primary model string for CrewAI native integration."""
        if self.settings.GROQ_API_KEY:
            return "groq/llama-3.3-70b-versatile"
        return "openai/gpt-4o-mini"

    def get_analysis_router(self):
        """
        Deep Reasoning Router for Agents (CrewAI).
        Uses longer timeouts (60s) and prioritizes Groq for maximum CrewAI stability.
        """
        from langchain_openai import ChatOpenAI

        # 1. GROQ (Llama 3.3 70B - PRODUCTION STANDARD FOR AGENTS)
        if self.settings.GROQ_API_KEY:
            return ChatOpenAI(
                model="llama-3.3-70b-versatile",
                api_key=self.settings.GROQ_API_KEY,
                base_url="https://api.groq.com/openai/v1",
                temperature=0.1,
                max_retries=1,
                timeout=30.0
            )
        
        # Fallback to OpenAI/OpenRouter
        return ChatOpenAI(
                model="openai/gpt-4o-mini",
                api_key=self.settings.OPENROUTER_API_KEY,
                base_url="https://openrouter.ai/api/v1",
                temperature=0.1,
                max_retries=1,
                timeout=30.0
            )

    def get_router(self):
        """
        Fast Router for Chat/UI interactions.
        Uses short timeouts (3s) to guarantee high-frequency response.
        """
        from langchain_openai import ChatOpenAI

        llm_chain = []
        
        # 1. GROQ (SPEED CHAMPION)
        if self.settings.GROQ_API_KEY:
            llm_chain.append(ChatOpenAI(
                model="llama-3.3-70b-versatile",
                api_key=self.settings.GROQ_API_KEY,
                base_url="https://api.groq.com/openai/v1",
                temperature=0.1,
                max_retries=0,
                timeout=2.5 # Instant cutoff for chat snappiness
            ))

        # 2. OPENROUTER
        if self.settings.OPENROUTER_API_KEY:
             llm_chain.append(ChatOpenAI(
                model="openai/gpt-4o-mini",
                api_key=self.settings.OPENROUTER_API_KEY,
                base_url="https://openrouter.ai/api/v1",
                temperature=0.1,
                max_retries=0,
                timeout=4.0
            ))

        if not llm_chain:
            raise ValueError("No LLM keys. Please configure GROQ_API_KEY or OPENROUTER_API_KEY.")

        primary = llm_chain[0]
        fallbacks = llm_chain[1:]
        if fallbacks:
            return primary.with_fallbacks(fallbacks, exceptions_to_handle=(Exception,))
        return primary

llm_router = LLMRouter()