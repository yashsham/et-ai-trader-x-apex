import logging
import json
from typing import Optional, Tuple
from app.core.config import settings
from app.services.llm_router import llm_router

logger = logging.getLogger(__name__)

class ChatRouter:
    def __init__(self, language: str = "English"):
        self._llm = None
        self.language = language

    @property
    def llm(self):
        if self._llm is None:
            from app.services.llm_router import llm_router
            self._llm = llm_router.get_router()
        return self._llm

    async def route(self, query: str) -> Tuple[str, str, list]:
        """
        Routes the query.
        Returns: (intent, response_or_trigger, symbols)
        Intents: 'CONVERSATIONAL', 'ANALYTICAL'
        """
        # 1. Catch extremely simple greetings without LLM
        simple_greetings = ["hi", "hello", "hey", "namaste", "good morning", "good evening"]
        if query.lower().strip() in simple_greetings:
             return "CONVERSATIONAL", self._get_greeting(), []

        # 2. Use LLM to classify intent and extract symbols
        prompt = f"""
        Analyze the user query: "{query}"
        
        Task:
        1. Classify Intent: CONVERSATIONAL (chat/meta) or ANALYTICAL (market/stock news/data)
        2. Extract Ticker Symbols: e.g. ["RELIANCE.NS", "AAPL"]
        
        Respond ONLY in JSON format:
        {{
            "intent": "CONVERSATIONAL" or "ANALYTICAL",
            "symbols": ["SYMBOL1", "SYMBOL2"],
            "reason": "short explanation"
        }}
        """
        
        try:
            from langchain_core.messages import HumanMessage
            # We use the LangChain LLM wrapper via llm_router
            response_obj = await self.llm.ainvoke([HumanMessage(content=prompt)])
            response = response_obj.content if hasattr(response_obj, "content") else str(response_obj)
            
            # Clean up response if it has markdown
            import re
            json_match = re.search(r"(\{.*\})", response, re.DOTALL)
            data = json.loads(json_match.group(1)) if json_match else json.loads(response)
            
            intent = data.get("intent", "ANALYTICAL")
            symbols = data.get("symbols", [])
            
            if intent == "CONVERSATIONAL":
                 return "CONVERSATIONAL", await self._generate_conversational_response(query), symbols
            
            return "ANALYTICAL", "[AGENT_TRIGGER]", symbols
            
        except Exception as e:
            logger.error(f"[Router] Classification failed: {e}")
            # Fallback to ANALYTICAL to be safe
            return "ANALYTICAL", "[AGENT_TRIGGER]", []

    def _get_greeting(self) -> str:
        if self.language.lower() == "hindi":
            return "नमस्ते! मैं आपका ET AI ट्रेडर कोपायलટ हूं। मैं आपकी संपत्ति बढ़ाने में कैसे मदद कर सकता हूं?"
        elif self.language.lower() == "gujarati":
            return "નમસ્તે! હું તમારો ET AI ટ્રેડર કોપાયલોટ છું. આજે હું કેવી રીતે તમારી સંપત્તિ વધારવામાં મદદ કરી શકું?"
        return "Hello! I am your ET AI Trader copilot. How can I help you build wealth today?"

    async def _generate_conversational_response(self, query: str) -> str:
        from langchain_core.messages import HumanMessage
        prompt = f"""
        Persona: You are the 'ET AI Trader Copilot', a helpful, professional, and friendly AI assistant for Indian traders.
        Language: Respond only in {self.language}.
        Query: "{query}"
        
        Task: Provide a short, friendly, and helpful conversational response. 
        If the user is asking who you are, explain that you are an AI powered by ET AI Engine, specializing in Indian stock markets.
        Keep it concise and professional.
        """
        try:
            response_obj = await self.llm.ainvoke([HumanMessage(content=prompt)])
            return response_obj.content if hasattr(response_obj, "content") else str(response_obj)
        except Exception as e:
            logger.error(f"[Router] Conversational response failed: {e}")
            return self._get_greeting()

chat_router = ChatRouter()
