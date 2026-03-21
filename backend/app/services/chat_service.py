import traceback
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.services.db_service import db_service
from app.chat.chat_crew import ChatbotCrew

class ChatService:
    def __init__(self):
        pass

    async def process_chat(self, query: str, user_id: str = "default_user", session_id: Optional[str] = None, language: str = "English"):
        """Main entry point for processing AI Assistant queries."""
        try:
            from app.chat.router import ChatRouter
            router = ChatRouter(language=language)
            intent, response_or_trigger = router.route(query)
            
            if intent == "CONVERSATIONAL":
                return {
                    "response": response_or_trigger,
                    "answer_type": "CONVERSATION",
                    "timestamp": datetime.now().isoformat()
                }

            # 1. Initialize Crew with context
            crew = ChatbotCrew(query, language=language)
            
            # 2. Execute Swarm
            result = crew.run()
            
            # 3. Dedicated Translation Layer
            from app.services.translation_service import translation_service
            # Robust extraction of the response text
            explanation = (
                result.get("explanation") or 
                result.get("raw_text") or 
                result.get("data", {}).get("explanation") or 
                result.get("data", {}).get("raw_text") or 
                "I'm sorry, I couldn't process that."
            )
            
            if language != "English":
                explanation = translation_service.translate(explanation, language)

            # 4. Return formatted response
            return {
                "response": explanation,
                "answer_type": "INSIGHT",
                "referenced_symbols": result.get("symbols", []),
                "cited_sources": ["yfinance", "NewsAPI"],
                "confidence": 0.9,
                "risk_note": "Trading involves significant risk. Always use a stop-loss.",
                "timestamp": datetime.now().isoformat()
            }

        except Exception as e:
            print(f"[ChatService] Error: {e}")
            traceback.print_exc()
            return {
                "response": "Encountered a glitch in the market matrix. Please try again.",
                "answer_type": "ERROR",
                "timestamp": datetime.now().isoformat()
            }

    def get_chat_history(self, user_id: str = "default_user", limit: int = 20):
        """Placeholder for fetching chat history from Supabase."""
        # For now, we'll return a helpful welcoming message
        return [
            {
                "role": "assistant",
                "content": "Namaste! I am your ET AI Trader copilot. How can I help you build wealth today?",
                "timestamp": datetime.now().isoformat()
            }
        ]

    async def stream_chat(self, query: str, user_id: str = "default_user", language: str = "English"):
        """Streaming version of chat with hybrid LangChain routing + CrewAI agents."""
        import asyncio
        import json
        from concurrent.futures import ThreadPoolExecutor
        from app.chat.router import ChatRouter
        from app.services.translation_service import translation_service

        # 1. Routing (LangChain based)
        router = ChatRouter(language=language)
        intent, response_or_trigger = router.route(query)

        if intent == "CONVERSATIONAL":
            # Direct response (Fast)
            words = response_or_trigger.split(" ")
            for i, word in enumerate(words):
                chunk = word + (" " if i < len(words) - 1 else "")
                yield f"data: {json.dumps({'token': chunk})}\n\n"
                await asyncio.sleep(0.03) # High speed for greetings
            yield "data: [DONE]\n\n"
            return

        # 2. Sequential Agentic Flow (For ANALYTICAL intent)
        # Initial "Thinking" tokens (Thematic)
        flow_tokens = [
            "🛡️ Reality Analyst: Gauging market sentiment... ",
            "🔍 Alpha Searcher: Gathering live pricing data... ",
            "📊 Strategy Bot: Synthesizing final insights... ",
            "\n\n---\n"
        ]
        
        for token in flow_tokens:
            chunk = token
            if language != "English":
                chunk = translation_service.translate(token, language)
            yield f"data: {json.dumps({'token': chunk})}\n\n"
            await asyncio.sleep(0.3)

        # Run actual Crew
        try:
            loop = asyncio.get_event_loop()
            with ThreadPoolExecutor() as pool:
                result = await loop.run_in_executor(pool, lambda: ChatbotCrew(query, language=language).run())
            
            # Robust extraction of the response text
            full_response = (
                result.get("explanation") or 
                result.get("raw_text") or 
                result.get("data", {}).get("explanation") or 
                result.get("data", {}).get("raw_text") or 
                "I have finished my analysis. How else can I help?"
            )
            
            # Stream final response
            words = full_response.split(" ")
            for i, word in enumerate(words):
                chunk = word + (" " if i < len(words) - 1 else "")
                yield f"data: {json.dumps({'token': chunk})}\n\n"
                await asyncio.sleep(0.04)

        except Exception as e:
            msg = f"Error during analysis: {str(e)}"
            print(f"[ChatService] ERROR: {msg}")
            if language != "English":
                msg = translation_service.translate(msg, language)
            yield f"data: {json.dumps({'token': msg})}\n\n"

        yield "data: [DONE]\n\n"

chat_service = ChatService()
