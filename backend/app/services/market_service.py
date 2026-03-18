import yfinance as yf
import pandas as pd
import requests
import os
from dotenv import load_dotenv

load_dotenv()

class MarketService:
    def __init__(self):
        self.news_api_key = os.getenv("NEWS_API_KEY")

    def get_stock_data(self, symbol: str):
        ticker = yf.Ticker(symbol)
        df = ticker.history(period="1mo")
        info = ticker.info
        return {
            "df": df,
            "current_price": info.get("currentPrice"),
            "open": info.get("open"),
            "dayHigh": info.get("dayHigh"),
            "dayLow": info.get("dayLow"),
            "volume": info.get("volume"),
            "marketCap": info.get("marketCap")
        }

    def get_news(self, symbol: str):
        if not self.news_api_key:
            return []
        
        url = f"https://newsapi.org/v2/everything?q={symbol}&sortBy=publishedAt&apiKey={self.news_api_key}"
        response = requests.get(url)
        if response.status_code == 200:
            articles = response.json().get("articles", [])
            return [{"title": a["title"], "description": a["description"]} for a in articles[:5]]
        return []

market_service = MarketService()
