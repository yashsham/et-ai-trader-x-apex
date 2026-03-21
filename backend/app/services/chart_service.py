import json
import traceback
import pandas as pd
import ta
import numpy as np
from datetime import datetime
from app.services.market_service import market_service
from app.services.llm_router import llm_router
from app.crew.chart_orchestrator import ChartCrew

class ChartIntelligenceService:
    def __init__(self):
        self.llm = llm_router.get_router()

    def compute_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Professional indicator suite using 'ta' library."""
        try:
            # Momentum
            df['rsi'] = ta.momentum.RSIIndicator(df['Close']).rsi()
            # Trend
            macd = ta.trend.MACD(df['Close'])
            df['macd'] = macd.macd()
            df['macd_signal'] = macd.macd_signal()
            df['ema20'] = ta.trend.EMAIndicator(df['Close'], window=20).ema_indicator()
            df['ema50'] = ta.trend.EMAIndicator(df['Close'], window=50).ema_indicator()
            # Volatility
            bb = ta.volatility.BollingerBands(df['Close'])
            df['bb_upper'] = bb.bollinger_hband()
            df['bb_lower'] = bb.bollinger_lband()
            df['atr'] = ta.volatility.AverageTrueRange(df['High'], df['Low'], df['Close']).average_true_range()
            # VWAP (Approximate if intraday data is used, otherwise just use as proxy)
            # yfinance history for periods > 5d usually doesn't give 1m intervals for accurate VWAP, 
            # we'll use Volume Weighted Price for the day as proxy.
            df['vwap'] = (df['Volume'] * (df['High'] + df['Low'] + df['Close']) / 3).cumsum() / df['Volume'].cumsum()
        except Exception as e:
            print(f"[Chart] Indicators failed: {e}")
        return df

    def find_levels(self, df: pd.DataFrame) -> dict:
        """Deterministic support/resistance discovery."""
        highs = df['High'].tail(20).values
        lows = df['Low'].tail(20).values
        
        # Simple local extrema
        resistance = float(np.max(highs))
        support = float(np.min(lows))
        
        return {
            "support": round(support, 2),
            "resistance": round(resistance, 2),
            "levels": [
                {"price": round(resistance, 2), "type": "Resistance", "note": "20-period Local High"},
                {"price": round(support, 2), "type": "Support", "note": "20-period Local Low"}
            ]
        }

    def get_chart_analysis(self, symbol: str, period: str = "3mo", language: str = "English"):
        """Main entry point for chart intelligence."""
        try:
            # 1. Fetch Data
            data = market_service.get_stock_data(symbol, period=period)
            df = data.get("df")
            if df is None or df.empty:
                raise ValueError(f"No chart data for {symbol}")

            # 2. Compute Indicators
            df = self.compute_indicators(df)
            
            # 3. Find Levels
            levels = self.find_levels(df)
            
            # 4. AI Analysis
            tech_context = {
                "rsi": float(df['rsi'].iloc[-1]),
                "macd": float(df['macd'].iloc[-1]),
                "ema20": float(df['ema20'].iloc[-1]),
                "current_price": float(df['Close'].iloc[-1]),
                "levels": levels
            }
            
            try:
                crew = ChartCrew(symbol, tech_context, language=language)
                ai_result = crew.run()
                # Ensure we handle the StandardResponse format
                if isinstance(ai_result, dict) and "data" in ai_result:
                    analysis = ai_result["data"]
                else:
                    analysis = ai_result
            except Exception as ai_err:
                print(f"[Chart] AI Analysis failed: {ai_err}")
                # Fallback deterministic analysis
                current_price = tech_context["current_price"]
                ema20 = tech_context["ema20"]
                
                analysis = {
                    "trend": "Strong Bullish" if current_price > ema20 * 1.02 else "Bullish" if current_price > ema20 else "Bearish",
                    "explanation": "AI Analyst is temporarily unavailable. Based on EMA20 and price action, a technical trend has been identified.",
                    "target": tech_context["levels"]["resistance"],
                    "stop_loss": tech_context["levels"]["support"],
                    "resistance": tech_context["levels"]["resistance"],
                    "support": tech_context["levels"]["support"],
                    "risk_reward": "1:1.5"
                }

            # 5. Format for Frontend
            chart_data = []
            for date, row in df.iterrows():
                chart_data.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "open": float(row["Open"]),
                    "high": float(row["High"]),
                    "low": float(row["Low"]),
                    "close": float(row["Close"]),
                    "volume": float(row["Volume"]),
                    "indicators": {
                        "rsi": float(row.get("rsi", 0)),
                        "macd": float(row.get("macd", 0)),
                        "ema20": float(row.get("ema20", 0)),
                        "ema50": float(row.get("ema50", 0)),
                        "bb_upper": float(row.get("bb_upper", 0)),
                        "bb_lower": float(row.get("bb_lower", 0)),
                        "vwap": float(row.get("vwap", 0))
                    }
                })

            return {
                "symbol": symbol.upper(),
                "period": period,
                "chartData": chart_data,
                "analysis": analysis,
                "levels": levels,
                "last_updated": datetime.now().isoformat(),
                "live_status": "Operational"
            }

        except Exception as e:
            print(f"[Chart] Total Failure: {e}")
            traceback.print_exc()
            return {"error": str(e), "live_status": "Degraded"}

chart_intelligence_service = ChartIntelligenceService()
