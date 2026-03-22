import logging
import time
from app.core.config import settings
from langchain_openai import ChatOpenAI

logger = logging.getLogger(__name__)

class LLMRouter:
    def __init__(self):
        self.settings = settings

    def get_router(self):
        """
        Builds a massive failover chain natively using LangChain ChatOpenAI classes.
        Priority: Groq (primary) > Gemini > OpenRouter > OpenAI
        """
        llm_chain = []

        # 1. GROQ (FASTEST & FREE)
        if self.settings.GROQ_API_KEY:
            for g_model in ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama3-8b-8192"]:
                llm_chain.append(ChatOpenAI(
                    model=g_model,
                    api_key=self.settings.GROQ_API_KEY,
                    base_url="https://api.groq.com/openai/v1",
                    temperature=0.1,
                    max_retries=0 # Instant failover on 429
                ))

        # 2. GEMINI (GOOGLE)
        if self.settings.GEMINI_API_KEY:
            # Note: Langchain has ChatGoogleGenerativeAI, but ChatOpenAI covers everything via OpenRouter/Proxy if needed.
            # To ensure compatibility without extra imports, OpenRouter is the best universal fallback.
            pass

        # 3. OPENROUTER (UNIVERSAL ALL-MODELS)
        if self.settings.OPENROUTER_API_KEY:
            for or_model in [
                "meta-llama/llama-3.3-70b-instruct:free",
                "google/gemini-2.0-flash-lite-preview-02-05:free",
                "microsoft/phi-4-reasoning:free"
            ]:
                llm_chain.append(ChatOpenAI(
                    model=or_model,
                    api_key=self.settings.OPENROUTER_API_KEY,
                    base_url="https://openrouter.ai/api/v1",
                    temperature=0.1,
                    max_retries=0
                ))

        # 4. OPENAI (PAID BACKUP)
        if self.settings.OPENAI_API_KEY:
            llm_chain.append(ChatOpenAI(
                model="gpt-4o-mini",
                api_key=self.settings.OPENAI_API_KEY,
                temperature=0.1,
                max_retries=0
            ))

        if not llm_chain:
            logger.critical("[Router] No LLM keys found. AI features will fail.")
            raise ValueError("CRITICAL: No LLM API keys configured.")

        # Build fallback chain
        primary = llm_chain[0]
        fallbacks = llm_chain[1:]
        
        # CrewAI natively supports LangChain BaseChatModels and Runnables
        if fallbacks:
            return primary.with_fallbacks(fallbacks)
        
        return primary

llm_router = LLMRouter()