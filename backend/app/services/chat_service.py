import traceback
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.services.db_service import db_service
from app.chat.chat_crew import ChatbotCrew

class ChatService:
    def __init__(self):
        pass

    async def process_chat(self, query: str, user_id: str = "default_user", session_id: Optional[str] = None):
        """Main entry point for processing AI Assistant queries."""
        try:
            # 1. Initialize Crew with context
            # (In a real app, we'd fetch previous messages from DB here for memory)
            crew = ChatbotCrew(query)
            
            # 2. Execute Swarm
            result = crew.run()
            
            # 3. Persist to History (Audit Log as proxy for now)
            db_service.save_audit_log(
                event_type="chat_interaction",
                severity="INFO",
                user_id=user_id,
                details={
                    "query": query,
                    "session_id": session_id,
                    "response_summary": result.get("data", {}).get("explanation")[:100] if result.get("data") else "Error"
                }
            )

            # 4. Return formatted response
            data = result.get("data", {})
            return {
                "response": data.get("explanation", "I'm sorry, I couldn't process that."),
                "answer_type": "INSIGHT",
                "referenced_symbols": data.get("symbols", []),
                "cited_sources": ["yfinance", "NewsAPI", "Internal RAG"],
                "confidence": data.get("confidence", 0.8),
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

    async def stream_chat(self, query: str, user_id: str = "default_user"):
        """Streaming version of chat for realtime frontend feedback."""
        import asyncio
        import json
        from concurrent.futures import ThreadPoolExecutor

        # 1. Initial "Thinking" tokens to show the agents are working
        flow_tokens = [
            "Agent: Deep Research Expert is gathering data... ",
            "Agent: Strategic Analyst is reviewing patterns... ",
            "Agent: Market Sentiment Bot is reading the news... ",
            "\n\n"
        ]
        
        for token in flow_tokens:
            yield f"data: {json.dumps({'token': token})}\n\n"
            await asyncio.sleep(0.4)

        # 2. Run the actual CrewAI process in a thread pool to not block the event loop
        try:
            loop = asyncio.get_event_loop()
            with ThreadPoolExecutor() as pool:
                result = await loop.run_in_executor(pool, lambda: ChatbotCrew(query).run())
            
            # Extract response
            data = result.get("data", {})
            full_response = data.get("explanation", "I have finished my analysis. How else can I help?")
            
            # 3. Stream the final response word by word
            words = full_response.split(" ")
            for i, word in enumerate(words):
                # Add back the space we split on
                chunk = word + (" " if i < len(words) - 1 else "")
                yield f"data: {json.dumps({'token': chunk})}\n\n"
                await asyncio.sleep(0.05) # "Realtime" typing effect

        except Exception as e:
            yield f"data: {json.dumps({'token': f'Error during analysis: {str(e)}'})}\n\n"

        yield "data: [DONE]\n\n"

chat_service = ChatService()
