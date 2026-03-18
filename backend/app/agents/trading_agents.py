"""
CrewAI Agents with full LLM auto-switching chain:
  1. OpenAI       (gpt-4-turbo)
  2. Google Gemini (gemini-1.5-pro)
  3. Groq         (llama-3.3-70b-versatile - FREE, very fast)
  4. OpenRouter   (any model via API)
  5. HuggingFace  (HuggingFaceHub inference)
First available key wins. Falls through silently on failure.
"""
import os
from crewai import Agent
from dotenv import load_dotenv

load_dotenv()


def _get_llm():
    """Build an LLM with auto-switching fallback priority."""

    # ── 1. OpenAI ─────────────────────────────────────────────
    if os.getenv("OPENAI_API_KEY"):
        try:
            from langchain_openai import ChatOpenAI
            print("[LLM] ✅ OpenAI")
            return ChatOpenAI(
                model=os.getenv("MODEL", "gpt-4-turbo"),
                api_key=os.getenv("OPENAI_API_KEY")
            )
        except Exception as e:
            print(f"[LLM] OpenAI failed: {e}")

    # ── 2. Google Gemini ───────────────────────────────────────
    if os.getenv("GEMINI_API_KEY"):
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            print("[LLM] ✅ Google Gemini (fallback)")
            return ChatGoogleGenerativeAI(
                model="gemini-1.5-pro",
                google_api_key=os.getenv("GEMINI_API_KEY")
            )
        except Exception as e:
            print(f"[LLM] Gemini failed: {e}")

    # ── 3. Groq (FREE, Ultra-fast) ─────────────────────────────
    if os.getenv("GROQ_API_KEY"):
        try:
            from langchain_groq import ChatGroq
            print("[LLM] ✅ Groq (fallback)")
            return ChatGroq(
                model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
                api_key=os.getenv("GROQ_API_KEY")
            )
        except Exception as e:
            print(f"[LLM] Groq failed: {e}")

    # ── 4. OpenRouter ──────────────────────────────────────────
    if os.getenv("OPENROUTER_API_KEY"):
        try:
            from langchain_openai import ChatOpenAI
            print("[LLM] ✅ OpenRouter (fallback)")
            return ChatOpenAI(
                model=os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini"),
                api_key=os.getenv("OPENROUTER_API_KEY"),
                base_url="https://openrouter.ai/api/v1"
            )
        except Exception as e:
            print(f"[LLM] OpenRouter failed: {e}")

    # ── 5. HuggingFace Hub ─────────────────────────────────────
    if os.getenv("HUGGINGFACE_API_KEY"):
        try:
            from langchain_huggingface import HuggingFaceEndpoint
            print("[LLM] ✅ HuggingFace (fallback)")
            return HuggingFaceEndpoint(
                repo_id=os.getenv("HF_MODEL", "mistralai/Mistral-7B-Instruct-v0.3"),
                huggingfacehub_api_token=os.getenv("HUGGINGFACE_API_KEY")
            )
        except Exception as e:
            print(f"[LLM] HuggingFace failed: {e}")

    raise RuntimeError(
        "❌ No LLM API key found. Add at least one of:\n"
        "  OPENAI_API_KEY, GEMINI_API_KEY, GROQ_API_KEY, "
        "OPENROUTER_API_KEY, HUGGINGFACE_API_KEY"
    )


class TradingAgents:
    def __init__(self):
        self.llm = _get_llm()

    def _make_agent(self, role, goal, backstory):
        return Agent(
            role=role,
            goal=goal,
            backstory=backstory,
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )

    def data_agent(self):
        return self._make_agent(
            role="Market Data Collector",
            goal="Fetch accurate stock price, volume, and recent news data",
            backstory="Expert in financial data aggregation with 15 years in quant research."
        )

    def signal_agent(self):
        return self._make_agent(
            role="Technical Analyst AI",
            goal="Identify high-probability trading signals and breakout patterns",
            backstory="A wizard of candlestick patterns, RSI, MACD, and Fibonacci levels."
        )

    def sentiment_agent(self):
        return self._make_agent(
            role="Market Sentiment Analyst",
            goal="Evaluate news sentiment and market mood around specific stocks",
            backstory="Specializes in NLP and behavioural finance."
        )

    def portfolio_agent(self):
        return self._make_agent(
            role="Portfolio Risk Strategist",
            goal="Assess risk exposure and portfolio impact of adding this trade",
            backstory="Former hedge fund risk manager who prioritizes capital preservation."
        )

    def decision_agent(self):
        return self._make_agent(
            role="AI Trading Strategist",
            goal="Generate final BUY/SELL/HOLD with entry, target, stop-loss and Hinglish reasoning",
            backstory="The ultimate decision maker who weighs all evidence before acting."
        )
