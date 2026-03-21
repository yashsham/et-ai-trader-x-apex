import logging
import json
from typing import Optional, Tuple
from app.core.config import settings
from app.services.llm_router import llm_router

logger = logging.getLogger(__name__)

class ChatRouter:
    def __init__(self, language: str = "English"):
        self.language = language
        self.llm = llm_router.get_router()

    def route(self, query: str) -> Tuple[str, str, list]:
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
            # We use the CrewAI LLM wrapper via llm_router
            response = self.llm.call([{"role": "user", "content": prompt}])
            # Clean up response if it has markdown
            import re
            json_match = re.search(r"(\{.*\})", response, re.DOTALL)
            data = json.loads(json_match.group(1)) if json_match else json.loads(response)
            
            intent = data.get("intent", "ANALYTICAL")
            symbols = data.get("symbols", [])
            
            if intent == "CONVERSATIONAL":
                 return "CONVERSATIONAL", self._generate_conversational_response(query), symbols
            
            return "ANALYTICAL", "[AGENT_TRIGGER]", symbols
            
        except Exception as e:
            logger.error(f"[Router] Classification failed: {e}")
            # Fallback to ANALYTICAL to be safe
            return "ANALYTICAL", "[AGENT_TRIGGER]", []

    def _get_greeting(self) -> str:
        if self.language.lower() == "hindi":
            return "नमस्ते! मैं आपका ET AI ट्रेडर कोपायलट हूं। मैं आपकी संपत्ति बढ़ाने में कैसे मदद कर सकता हूं?"
        elif self.language.lower() == "gujarati":
            return "નમસ્તે! હું તમારો ET AI ટ્રેડર કોપાયલોટ છું. આજે હું કેવી રીતે તમારી સંપત્તિ વધારવામાં મદદ કરી શકું?"
        return "Hello! I am your ET AI Trader copilot. How can I help you build wealth today?"

    def _generate_conversational_response(self, query: str) -> str:
        prompt = f"""
        Persona: You are the 'ET AI Trader Copilot', a helpful, professional, and friendly AI assistant for Indian traders.
        Language: Respond only in {self.language}.
        Query: "{query}"
        
        Task: Provide a short, friendly, and helpful conversational response. 
        If the user is asking who you are, explain that you are an AI powered by ET AI Engine, specializing in Indian stock markets.
        Keep it concise and professional.
        """
        try:
            return self.llm.call([{"role": "user", "content": prompt}])
        except:
            return self._get_greeting()

chat_router = ChatRouter()
