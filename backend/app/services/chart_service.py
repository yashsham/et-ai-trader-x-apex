import json
import traceback
from app.services.market_service import market_service
from app.agents.trading_agents import _get_llm

class ChartIntelligenceService:
    def __init__(self):
        # Using the same LLM initialized in trading_agents with Groq/OpenAI
        self.llm = _get_llm()

    def get_chart_data_and_analysis(self, symbol: str, period: str = "1mo"):
        # 1. Fetch market data using existing service
        try:
            data = market_service.get_stock_data(symbol)
        except Exception as e:
            raise ValueError(f"Failed to fetch stock data for {symbol}: {str(e)}")

        df = data.get("df")
        if df is None or df.empty:
            raise ValueError(f"No historical chart data available for {symbol}")

        # 2. Format frontend chartData array
        chart_data = []
        for date, row in df.iterrows():
            chart_data.append({
                "date": date.strftime("%Y-%m-%d"),
                "open": float(row["Open"]),
                "high": float(row["High"]),
                "low": float(row["Low"]),
                "close": float(row["Close"]),
                "volume": float(row["Volume"])
            })

        # 3. Create context for LLM Analysis
        # We take the tail of the dataframe so we don't blow up token limits
        recent_data = df.tail(15).to_csv()
        current_price = data.get("current_price", chart_data[-1]["close"])

        prompt = f"""
You are an elite stock market technical analyst.
Analyze the following recent 15 trading days OHLCV data for {symbol}. Current Price is ₹{current_price}.

{recent_data}

Based on this, determine technical levels and generate an analysis.
Output ONLY a valid JSON object matching exactly this schema, with no markdown code blocks or extra text:
{{
  "trend": "Bullish ↑" | "Bearish ↓" | "Neutral ↔",
  "support": number,
  "resistance": number,
  "target": number,
  "stop_loss": number,
  "risk_reward": "1:X (e.g. 1:3.2)",
  "explanation": "2-3 short sentences in Hinglish. e.g. 'Yeh stock apni resistance levels test kar raha hai. Breakout possibility strong hai aane waale sessions mein...'"
}}
"""

        # 4. Invoke LLM and parse JSON
        try:
            # invoke returns AIMessage object, `.content` gets the string
            res = self.llm.invoke(prompt).content
            
            # Clean markdown formatting if returning ```json
            cleaned_res = res.replace("```json", "").replace("```", "").strip()
            analysis = json.loads(cleaned_res)
        except Exception as e:
            print("Chart LLM Analysis Failed:", e)
            traceback.print_exc()
            # Provide sensible fallback
            analysis = {
                "trend": "Neutral ↔",
                "support": current_price * 0.95,
                "resistance": current_price * 1.05,
                "target": current_price * 1.10,
                "stop_loss": current_price * 0.90,
                "risk_reward": "1:2.0",
                "explanation": "Technical analysis available nahi hai abhi. Default levels provide kiye gaye hain trailing data se."
            }

        return {
            "symbol": symbol.upper(),
            "chartData": chart_data,
            "analysis": analysis
        }

chart_intelligence_service = ChartIntelligenceService()
