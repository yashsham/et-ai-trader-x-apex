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

        # 1. Immediate Feedback (Real-time feeling)
        yield f"data: {json.dumps({'token': '🛡️ ET AI Engine: Initializing secure uplink... '})}\n\n"
        await asyncio.sleep(0.01)

        # 2. Routing (LangChain based) - Now happens after first yield
        # 2. Routing (LangChain based) - Now happens AFTER first yield
        from app.chat.router import ChatRouter
        router = ChatRouter(language=language)
        
        # Temporary status to show we are classification
        # yield f"data: {json.dumps({'token': 'Routing intelligence request... '})}\n\n"
        
        # Blocking call to router (Gemini 2.0 usually fast, but still a round trip)
        intent, response_or_trigger, symbols = router.route(query)

        if intent == "CONVERSATIONAL":
            # Direct response (Fast)
            words = response_or_trigger.split(" ")
            for i, word in enumerate(words):
                chunk = word + (" " if i < len(words) - 1 else "")
                yield f"data: {json.dumps({'token': chunk})}\n\n"
                await asyncio.sleep(0.02) # High speed for greetings
            yield "data: [DONE]\n\n"
            return

        # 3. Sequential Agentic Flow (For ANALYTICAL intent)
        # Pre-translated static thinking tokens to avoid API round trips
        thinking_map = {
            "English": [
                "🛡️ Reality Analyst: Gauging market sentiment... ",
                "🔍 Alpha Searcher: Gathering live pricing data... ",
                "📊 Strategy Bot: Synthesizing final insights... ",
                "\n\n---\n"
            ],
            "Hindi": [
                "🛡️ रियलिटी एनालिस्ट: बाजार की धारणा का आकलन... ",
                "🔍 अल्फा सर्चर: लाइव प्राइसिंग डेटा एकत्र करना... ",
                "📊 स्ट्रैटेजी बॉट: अंतिम अंतर्दृष्टि का विश्लेषण... ",
                "\n\n---\n"
            ],
            "Gujarati": [
                "🛡️ રિયાલિટી એનાલિસ્ટ: બજારની સેન્ટિમેન્ટ તપાસવી... ",
                "🔍 આલ્ફા સર્ચર: લાઈવ પ્રાઈસીંગ ડેટા ભેગા કરવા... ",
                "📊 સ્ટ્રેટેજી બોટ: ફાઈનલ આંતરદૃષ્ટિ તૈયાર કરવી... ",
                "\n\n---\n"
            ]
        }
        
        flow_tokens = thinking_map.get(language, thinking_map["English"])
        
        for token in flow_tokens:
            yield f"data: {json.dumps({'token': token})}\n\n"
            await asyncio.sleep(0.1) # Snappier sequence

        # Run Lightning-Fast Single-Shot Analysis (<5s)
        # Run Lightning-Fast Single-Shot Analysis (<5s)
        try:
            from app.services.llm_router import llm_router
            from app.services.market_service import market_service

            # Gather data extremely fast directly from the service
            market_ctx = ""
            if symbols:
                target_symbol = symbols[0] # Focus on the primary symbol
                data = market_service.get_stock_data(target_symbol)
                market_ctx = (
                    f"Symbol: {target_symbol}\n"
                    f"Price: {data.get('current_price', 'N/A')}\n"
                    f"Day High: {data.get('dayHigh', 'N/A')}\n"
                    f"Day Low: {data.get('dayLow', 'N/A')}\n"
                    f"Volume: {data.get('volume', 'N/A')}\n"
                )
            else:
                market_ctx = "General market inquiry."
            
            # Construct a massive immediate prompt
            prompt = f"""
            Act as an elite Wall Street CIO managing a high-frequency trading desk.
            You must reply in {language}.
            
            User's explicit question: '{query}'
            
            LIVE MARKET DATA JUST FETCHED:
            {market_ctx}

            Respond with a concise, high-conviction analysis. Structure your response cleanly.
            Always include:
            1. The Core Alignment (Overall trend)
            2. The Technical Blueprint (Support/Resistance/Momentum)
            3. The Final Verdict (Buy/Sell/Hold)
            
            DO NOT output JSON. Output beautiful Markdown with emojis. Go straight to the point.
            """

            # Direct call to the failover router — lightning fast
            llm = llm_router.get_router()
            result_str = llm.call([{"role": "user", "content": prompt}])

            full_response = result_str
            if "### 🎯 **SIGNAL:" not in result_str and "Final Verdict" not in result_str:
                # Add risk disclaimer dynamically if not explicitly in response
                full_response += "\n\n*Disclaimer: Trading involves significant risk. This is AI generated analysis.*"

            # Stream final response in chunks
            words = full_response.split()
            for i, word in enumerate(words):
                chunk = word + (" " if i < len(words) - 1 else "")
                yield f"data: {json.dumps({'token': chunk})}\n\n"
                await asyncio.sleep(0.01) # Ultra fast streaming


        except Exception as e:
            error_str = str(e).lower()
            
            # Classify error for user-friendly messaging
            if "429" in error_str or "resource_exhausted" in error_str or "quota" in error_str or "rate_limit" in error_str:
                # Quota/rate-limit — all models tried
                user_msg = (
                    "⚠️ Our AI engines are running at full capacity right now. "
                    "The system automatically tried all available models. "
                    "Please wait 60 seconds and try again — responses will resume automatically."
                )
            elif "timeout" in error_str or "timed out" in error_str:
                user_msg = (
                    "⏱️ The AI analysis is taking longer than expected. "
                    "Please retry your query — I'll get a faster response next time."
                )
            elif "api_key" in error_str or "authentication" in error_str or "unauthorized" in error_str:
                user_msg = "🔑 AI engine authentication issue. Please contact support."
            else:
                user_msg = (
                    "🔄 Analysis encountered a technical hiccup. "
                    "Please rephrase your query or try again in a moment."
                )
            
            print(f"[ChatService] ERROR (classified): {str(e)[:200]}")
            
            if language != "English":
                user_msg = translation_service.translate(user_msg, language)
            yield f"data: {json.dumps({'token': user_msg})}\n\n"

        yield "data: [DONE]\n\n"

chat_service = ChatService()
