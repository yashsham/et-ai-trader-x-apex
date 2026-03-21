import pandas as pd
import ta
import yfinance as yf
from datetime import datetime
from typing import List, Dict, Any
from app.services.market_service import market_service
from app.services.db_service import db_service
from app.crew.radar_orchestrator import RadarCrew
from app.core.audit_logger import audit_logger

class RadarService:
    def __init__(self):
        self.default_symbols = ["RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS", "TATAMOTORS.NS"]

    def detect_technical_patterns(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Detect common technical patterns like RSI oversold, MACD crossover, Trend."""
        if len(df) < 30:
            return {"pattern": "Inconclusive", "strength": 0}

        # Indicators
        rsi = ta.momentum.RSIIndicator(df["Close"]).rsi().iloc[-1]
        macd = ta.trend.MACD(df["Close"])
        macd_val = macd.macd().iloc[-1]
        macd_signal = macd.macd_signal().iloc[-1]
        
        # Simple pattern logic
        pattern = "Consolidation"
        strength = 50
        
        if rsi < 35: 
            pattern = "Oversold / Reversal"
            strength = 75
        elif rsi > 65:
            pattern = "Overbought"
            strength = 40
        
        if macd_val > macd_signal and rsi > 50:
            pattern = "Bullish Breakout"
            strength = 85
            
        return {
            "rsi": round(rsi, 2),
            "macd_state": "Bullish" if macd_val > macd_signal else "Bearish",
            "detected_pattern": pattern,
            "pattern_strength": strength
        }

    async def scan_symbol(self, symbol: str, language: str = "English") -> Dict[str, Any]:
        """Perform a comprehensive AI-driven scan for a single symbol."""
        audit_logger.log_event("RADAR_SCAN", "LOW", {"symbol": symbol})
        
        try:
            # ... (history and patterns logic)
            ticker = yf.Ticker(symbol)
            df = ticker.history(period="3mo")
            if df.empty:
                return {"symbol": symbol, "error": "No data found"}

            tech = self.detect_technical_patterns(df)
            
            # 3. Run AI Radar Crew
            crew = RadarCrew(symbol, technical_context=tech, language=language)
            ai_result = crew.run()
            
            # 4. Synthesize Final Radar Item
            data = ai_result.get("data", {})
            
            # --- Dedicated Translation Layer ---
            reasoning = data.get("explanation") or data.get("reasoning")
            if language != "English" and reasoning:
                from app.services.translation_service import translation_service
                reasoning = translation_service.translate(reasoning, language)

            radar_item = {
                "symbol": symbol,
                "signal_type": data.get("signal_type", "HOLD"),
                "confidence": data.get("confidence", 50),
                "high_conviction": data.get("high_conviction", False),
                "trade_ready": data.get("trade_ready", False),
                "entry_zone": data.get("entry_zone") or tech.get("detected_pattern"),
                "target": data.get("target"),
                "stop_loss": data.get("stop_loss"),
                "reasoning": reasoning,
                "tech_metrics": tech,
                "timestamp": datetime.now().isoformat()
            }
            
            # 5. Persist to DB
            db_service.save_analysis(symbol, ai_result) # Reusing standard analysis save
            
            return radar_item
        except Exception as e:
            print(f"[Radar] Error scanning {symbol}: {e}")
            return {"symbol": symbol, "error": str(e)}

    async def run_comprehensive_scan(self, symbols: List[str] = None, language: str = "English") -> List[Dict[str, Any]]:
        """Scan multiple symbols and rank them by conviction."""
        target_symbols = symbols or self.default_symbols
        results = []
        
        for s in target_symbols:
            res = await self.scan_symbol(s, language=language)
            if "error" not in res:
                results.append(res)
        
        # Rank by confidence
        ranked = sorted(results, key=lambda x: x.get("confidence", 0), reverse=True)
        return ranked

    def get_live_radar(self, limit=10, language: str = "English"):
        """Fetch the most recent high-conviction results from history and translate on-the-fly."""
        data = db_service.get_all_analyses(limit=limit)
        
        if language == "English":
            return data
            
        from app.services.translation_service import translation_service
        for item in data:
            # The reasoning/explanation might be in decision_output
            content = item.get("decision_output", "")
            if content:
                # If it's JSON-like, try to extract the reasoning
                try:
                    import json
                    import re
                    json_match = re.search(r'\{[\s\S]*\}', content)
                    if json_match:
                        parsed = json.loads(json_match.group())
                        reasoning = parsed.get("reasoning") or parsed.get("explanation")
                        if reasoning:
                            translated = translation_service.translate(reasoning, language)
                            # Update the reasoning in the JSON and put it back
                            if "reasoning" in parsed: parsed["reasoning"] = translated
                            else: parsed["explanation"] = translated
                            item["decision_output"] = json.dumps(parsed)
                        continue
                except:
                    pass
                
                # If not JSON or parsing failed, translate the whole block
                item["decision_output"] = translation_service.translate(content, language)
                
        return data

radar_service = RadarService()
