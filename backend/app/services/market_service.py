"""
Market Data Service with auto-switching fallback:
  Stock: yfinance → Finnhub
  News:  NewsAPI  → GNews
"""
import yfinance as yf
import requests
import os
from dotenv import load_dotenv

load_dotenv()

class MarketService:
    def __init__(self):
        self.news_api_key   = os.getenv("NEWS_API_KEY")
        self.gnews_api_key  = os.getenv("GNEWS_API_KEY")
        self.finnhub_api_key= os.getenv("FINNHUB_API_KEY")

    # ── STOCK DATA ────────────────────────────────────────────────
    def get_stock_data(self, symbol: str):
        """Primary: yfinance  →  Fallback: Finnhub"""
        try:
            return self._yfinance_data(symbol)
        except Exception as e:
            print(f"[yfinance] failed: {e} — switching to Finnhub")
            return self._finnhub_data(symbol)

    def _yfinance_data(self, symbol: str):
        ticker = yf.Ticker(symbol)
        df = ticker.history(period="1mo")
        if df.empty:
            raise ValueError("Empty dataframe from yfinance")
        info = ticker.info
        return {
            "source": "yfinance",
            "df": df,
            "current_price": info.get("currentPrice") or df["Close"].iloc[-1],
            "open":    info.get("open"),
            "dayHigh": info.get("dayHigh"),
            "dayLow":  info.get("dayLow"),
            "volume":  info.get("volume"),
            "marketCap": info.get("marketCap"),
        }

    def _finnhub_data(self, symbol: str):
        if not self.finnhub_api_key:
            raise ValueError("No Finnhub API key configured")
        # Finnhub quote endpoint
        url = f"https://finnhub.io/api/v1/quote?symbol={symbol}&token={self.finnhub_api_key}"
        r = requests.get(url, timeout=5)
        r.raise_for_status()
        q = r.json()
        return {
            "source": "finnhub",
            "df": None,                   # No historical df from quote endpoint
            "current_price": q.get("c"),
            "open":    q.get("o"),
            "dayHigh": q.get("h"),
            "dayLow":  q.get("l"),
            "volume":  None,
            "marketCap": None,
        }

    # ── NEWS DATA ─────────────────────────────────────────────────
    def get_news(self, symbol: str):
        """Primary: NewsAPI  →  Fallback: GNews"""
        clean = symbol.replace(".NS", "").replace(".BSE", "")
        try:
            return self._newsapi(clean)
        except Exception as e:
            print(f"[NewsAPI] failed: {e} — switching to GNews")
            try:
                return self._gnews(clean)
            except Exception as e2:
                print(f"[GNews] failed: {e2}")
                return []

    def _newsapi(self, query: str):
        if not self.news_api_key:
            raise ValueError("No NewsAPI key configured")
        url = (
            f"https://newsapi.org/v2/everything"
            f"?q={query}&sortBy=publishedAt&language=en"
            f"&apiKey={self.news_api_key}"
        )
        r = requests.get(url, timeout=5)
        r.raise_for_status()
        articles = r.json().get("articles", [])
        return [{"title": a["title"], "description": a.get("description")} for a in articles[:5]]

    def _gnews(self, query: str):
        if not self.gnews_api_key:
            raise ValueError("No GNews API key configured")
        url = (
            f"https://gnews.io/api/v4/search"
            f"?q={query}&token={self.gnews_api_key}&lang=en&max=5"
        )
        r = requests.get(url, timeout=5)
        r.raise_for_status()
        articles = r.json().get("articles", [])
        return [{"title": a["title"], "description": a.get("description")} for a in articles]


market_service = MarketService()
