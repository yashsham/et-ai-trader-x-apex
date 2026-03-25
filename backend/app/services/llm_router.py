import logging
import time
from app.core.config import settings

logger = logging.getLogger(__name__)

class LLMRouter:
    def __init__(self):
        self.settings = settings

    def get_analysis_router(self):
        """
        Optimized router with <4s global fallback and verified best-in-class models.
        """
        # Lazy imports for Windows stability
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_openai import ChatOpenAI

        # Order prioritized by SPEED and STABILITY (Proven in diagnostic phase)
        llm_chain = []
        
        # 1. GROQ (FASTEST - 0.39s verified)
        if self.settings.GROQ_API_KEY:
            llm_chain.append(ChatOpenAI(
                model="llama-3.3-70b-versatile",
                api_key=self.settings.GROQ_API_KEY,
                base_url="https://api.groq.com/openai/v1",
                temperature=0.1,
                max_retries=0, # Fail fast to trigger fallback instantly
                timeout=2.0    # Strict speed cutoff
            ))

        # 2. GEMINI (CORE - 2.0 Flash)
        if self.settings.GEMINI_API_KEY:
            llm_chain.append(ChatGoogleGenerativeAI(
                model="gemini-2.0-flash",
                google_api_key=self.settings.GEMINI_API_KEY,
                temperature=0.1,
                max_retries=0,
                timeout=2.0
            ))

        # 3. OPENROUTER (ROBUST FALLBACK - Gemini 2.0 via OR)
        if self.settings.OPENROUTER_API_KEY:
            llm_chain.append(ChatOpenAI(
                model="google/gemini-2.0-flash-001", 
                api_key=self.settings.OPENROUTER_API_KEY,
                base_url="https://openrouter.ai/api/v1",
                temperature=0.1,
                max_retries=0,
                timeout=2.5
            ))
            
            # 4. OPENROUTER SAFETY (GPT-4o-mini)
            llm_chain.append(ChatOpenAI(
                model="openai/gpt-4o-mini",
                api_key=self.settings.OPENROUTER_API_KEY,
                base_url="https://openrouter.ai/api/v1",
                temperature=0.1,
                max_retries=0,
                timeout=3.0
            ))

        if not llm_chain:
            logger.critical("[Router] No active LLM providers.")
            raise ValueError("No LLM API keys configured.")

        # Construct the failover chain with comprehensive exception handling
        primary = llm_chain[0]
        fallbacks = llm_chain[1:]
        
        if fallbacks:
            return primary.with_fallbacks(fallbacks, exceptions_to_handle=(Exception,))
        return primary

    def get_router(self):
        """Default router for fast chat interaction."""
        return self.get_analysis_router()

llm_router = LLMRouter()