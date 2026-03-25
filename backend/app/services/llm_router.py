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
        if self.settings.GEMINI_API_KEY:
            return "gemini/gemini-2.0-flash"
        return "gpt-4o-mini"

    def get_analysis_router(self):
        """
        Deep Reasoning Router for Agents (CrewAI).
        Uses longer timeouts (60s) and prioritizes Groq for maximum CrewAI stability.
        """
        from langchain_openai import ChatOpenAI

        llm_chain = []
        
        # 1. GROQ (Llama 3.3 70B - PRODUCTION STANDARD FOR AGENTS)
        if self.settings.GROQ_API_KEY:
            llm_chain.append(ChatOpenAI(
                model="llama-3.3-70b-versatile",
                api_key=self.settings.GROQ_API_KEY,
                base_url="https://api.groq.com/openai/v1",
                temperature=0.1,
                max_retries=1,
                timeout=30.0
            ))
        return llm_chain[0]

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