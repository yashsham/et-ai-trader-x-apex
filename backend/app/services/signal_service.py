import pandas as pd
import ta

class SignalService:
    def analyze(self, df: pd.DataFrame):
        # Calculate RSI
        rsi = ta.momentum.RSIIndicator(df['Close']).rsi().iloc[-1]
        
        # Calculate Moving Averages
        sma_20 = ta.trend.SMAIndicator(df['Close'], window=20).sma_indicator().iloc[-1]
        sma_50 = ta.trend.SMAIndicator(df['Close'], window=50).sma_indicator().iloc[-1]
        
        # Detect Breakout
        recent_high = df['High'].iloc[-20:-1].max()
        current_price = df['Close'].iloc[-1]
        is_breakout = current_price > recent_high
        
        signal = "Neutral"
        if is_breakout and rsi > 50:
            signal = "Breakout"
        elif rsi < 30:
            signal = "Oversold"
        elif rsi > 70:
            signal = "Overbought"
            
        return {
            "rsi": rsi,
            "sma_20": sma_20,
            "sma_50": sma_50,
            "signal": signal,
            "is_breakout": is_breakout,
            "confidence": 85 if signal != "Neutral" else 50
        }

signal_service = SignalService()
