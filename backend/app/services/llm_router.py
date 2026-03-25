import logging
import time
from app.core.config import settings

logger = logging.getLogger(__name__)

class LLMRouter:
    def __init__(self):
        self.settings = settings

    def get_analysis_router(self):
        """
        Deep Reasoning Router for Agents (CrewAI).
        Uses longer timeouts (15s) and prioritizes high-stability models like Gemini.
        """
        # Lazy imports for Windows stability
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_openai import ChatOpenAI

        llm_chain = []
        
        # 1. GEMINI 2.0 FLASH (High stability/Rate-limits for deep reasoning)
        if self.settings.GEMINI_API_KEY:
            llm_chain.append(ChatGoogleGenerativeAI(
                model="gemini-2.0-flash",
                google_api_key=self.settings.GEMINI_API_KEY,
                temperature=0.1,
                max_retries=1,
                timeout=15.0 # Give agents plenty of time to reason
            ))

        # 2. GROQ (FASTEST - Fallback for reasoning)
        if self.settings.GROQ_API_KEY:
            llm_chain.append(ChatOpenAI(
                model="llama-3.3-70b-versatile",
                api_key=self.settings.GROQ_API_KEY,
                base_url="https://api.groq.com/openai/v1",
                temperature=0.1,
                max_retries=1,
                timeout=10.0
            ))

        # 3. OPENROUTER (UNIVERSAL SAFETY NET)
        if self.settings.OPENROUTER_API_KEY:
            llm_chain.append(ChatOpenAI(
                model="google/gemini-2.0-flash-001",
                api_key=self.settings.OPENROUTER_API_KEY,
                base_url="https://openrouter.ai/api/v1",
                temperature=0.1,
                max_retries=1,
                timeout=15.0
            ))

        if not llm_chain:
            logger.critical("[Router] No active LLM providers.")
            raise ValueError("No LLM API keys configured.")

        primary = llm_chain[0]
        fallbacks = llm_chain[1:]
        
        if fallbacks:
            return primary.with_fallbacks(fallbacks, exceptions_to_handle=(Exception,))
        return primary

    def get_router(self):
        """
        Fast Router for Chat/UI interactions.
        Uses short timeouts (3s) to guarantee high-frequency response.
        """
        from langchain_google_genai import ChatGoogleGenerativeAI
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

        # 2. GEMINI 2.0 FLASH
        if self.settings.GEMINI_API_KEY:
            llm_chain.append(ChatGoogleGenerativeAI(
                model="gemini-2.0-flash",
                google_api_key=self.settings.GEMINI_API_KEY,
                temperature=0.1,
                max_retries=0,
                timeout=2.5
            ))

        # 3. OPENROUTER
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
            raise ValueError("No LLM keys.")

        primary = llm_chain[0]
        fallbacks = llm_chain[1:]
        if fallbacks:
            return primary.with_fallbacks(fallbacks, exceptions_to_handle=(Exception,))
        return primary

llm_router = LLMRouter()