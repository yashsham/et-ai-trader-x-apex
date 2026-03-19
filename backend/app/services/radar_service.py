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

    async def scan_symbol(self, symbol: str) -> Dict[str, Any]:
        """Perform a comprehensive AI-driven scan for a single symbol."""
        audit_logger.log_event("RADAR_SCAN", "LOW", {"symbol": symbol})
        
        try:
            # 1. Fetch History
            ticker = yf.Ticker(symbol)
            df = ticker.history(period="3mo")
            if df.empty:
                return {"symbol": symbol, "error": "No data found"}

            # 2. Technical Pre-filter
            tech = self.detect_technical_patterns(df)
            
            # 3. Run AI Radar Crew
            crew = RadarCrew(symbol, technical_context=tech)
            ai_result = crew.run()
            
            # 4. Synthesize Final Radar Item
            # Expected ai_result is StandardResponse.data format
            data = ai_result.get("data", {})
            
            radar_item = {
                "symbol": symbol,
                "signal_type": data.get("signal_type", "HOLD"),
                "confidence": data.get("confidence", 50),
                "high_conviction": data.get("high_conviction", False),
                "trade_ready": data.get("trade_ready", False),
                "entry_zone": data.get("entry_zone") or tech.get("detected_pattern"),
                "target": data.get("target"),
                "stop_loss": data.get("stop_loss"),
                "reasoning": data.get("explanation") or data.get("reasoning"),
                "tech_metrics": tech,
                "timestamp": datetime.now().isoformat()
            }
            
            # 5. Persist to DB
            db_service.save_analysis(symbol, ai_result) # Reusing standard analysis save
            
            return radar_item
        except Exception as e:
            print(f"[Radar] Error scanning {symbol}: {e}")
            return {"symbol": symbol, "error": str(e)}

    async def run_comprehensive_scan(self, symbols: List[str] = None) -> List[Dict[str, Any]]:
        """Scan multiple symbols and rank them by conviction."""
        target_symbols = symbols or self.default_symbols
        results = []
        
        for s in target_symbols:
            res = await self.scan_symbol(s)
            if "error" not in res:
                results.append(res)
        
        # Rank by confidence
        ranked = sorted(results, key=lambda x: x.get("confidence", 0), reverse=True)
        return ranked

    def get_live_radar(self, limit=10):
        """Fetch the most recent high-conviction results from history."""
        # For now, proxy to history filtered by conviction if possible,
        # or just recent analyses.
        data = db_service.get_all_analyses(limit=limit)
        return data

radar_service = RadarService()
