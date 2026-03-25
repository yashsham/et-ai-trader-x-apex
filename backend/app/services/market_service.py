import yfinance as yf
import requests
import pandas as pd
from typing import List, Dict, Any
from datetime import datetime
from app.core.config import settings
from app.services.cache_service import cache_service

class MarketService:
    def __init__(self):
        self.news_api_key   = settings.NEWS_API_KEY
        self.gnews_api_key  = settings.GNEWS_API_KEY
        self.finnhub_api_key= settings.FINNHUB_API_KEY
        self.tavily_api_key = settings.TAVILY_API_KEY

    # ── STOCK DATA ────────────────────────────────────────────────
    def get_stock_data(self, symbol: str, period: str = "1mo"):
        """Primary: yfinance  →  Fallback: Finnhub. Includes adaptive caching."""
        cache_key = f"stock_data_{symbol}_{period}"
        cached = cache_service.get(cache_key)
        if cached:
            return cached

        try:
            res = self._yfinance_data(symbol, period)
        except Exception as e:
            print(f"[yfinance] failed: {e} — switching to Finnhub")
            res = self._finnhub_data(symbol)
        
        if res:
            # High-fidelity charts (1d period) refresh every 15s, others 1hr
            expire = 15 if period == "1d" else 3600
            cache_service.set(cache_key, res, expire_seconds=expire)
        return res

    def _yfinance_data(self, symbol: str, period: str = "1mo"):
        """Optimised yfinance fetch — uses history() to get price and avoids slow .info where possible."""
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=period)
        if df.empty:
            raise ValueError(f"Empty dataframe from yfinance for {symbol}")
        
        # Avoid full .info (slow) — try fast_info first
        try:
            fast = ticker.fast_info
            current_price = fast.get("last_price") or df["Close"].iloc[-1]
            day_high = fast.get("day_high")
            day_low  = fast.get("day_low")
            open_p   = fast.get("open")
            volume   = fast.get("last_volume")
            m_cap    = fast.get("market_cap")
        except:
            # Fallback to dataframe price
            current_price = df["Close"].iloc[-1]
            day_high = df["High"].iloc[-1]
            day_low  = df["Low"].iloc[-1]
            open_p   = df["Open"].iloc[-1]
            volume   = df["Volume"].iloc[-1]
            m_cap    = None

        return {
            "source": "yfinance",
            "df": df,
            "current_price": float(current_price),
            "open":    float(open_p) if open_p else None,
            "dayHigh": float(day_high) if day_high else None,
            "dayLow":  float(day_low) if day_low else None,
            "volume":  int(volume) if volume else None,
            "marketCap": float(m_cap) if m_cap else None,
        }

    def get_stock_data_batch(self, symbols: List[str]) -> Dict[str, Any]:
        """
        Batch fetch multiple symbols using yf.download.
        Returns a dict mapping symbol -> current_price.
        This is significantly faster than sequential calls.
        """
        if not symbols: return {}
        try:
            # Download latest 2 days of data for all symbols
            data = yf.download(symbols, period="2d", interval="1d", group_by='ticker', progress=False)
            results = {}
            for sym in symbols:
                try:
                    ticker_data = data[sym] if len(symbols) > 1 else data
                    if not ticker_data.empty:
                        results[sym] = float(ticker_data["Close"].iloc[-1])
                except:
                    continue
            return results
        except Exception as e:
            print(f"[MarketService] Batch fetch failed: {e}")
            return {}

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
        """Primary: NewsAPI  →  Fallback: GNews. Includes 2-hour caching."""
        clean = symbol.replace(".NS", "").replace(".BSE", "")
        cache_key = f"news_data_{clean}"
        cached = cache_service.get(cache_key)
        if cached:
            return cached

        try:
            res = self._tavily(clean)
        except Exception as e:
            print(f"[Tavily] failed: {e} — switching to NewsAPI")
            try:
                res = self._newsapi(clean)
            except Exception as e2:
                print(f"[NewsAPI] failed: {e2} — switching to GNews")
                try:
                    res = self._gnews(clean)
                except Exception as e3:
                    print(f"[GNews] failed: {e3}")
                    res = []
        
        if res:
            cache_service.set(cache_key, res, expire_seconds=7200)
        return res

    def _newsapi(self, query: str):
        if not self.news_api_key:
            raise ValueError("No NewsAPI key configured")
        url = (
            f"https://newsapi.org/v2/everything"
            f"?q={query}&sortBy=publishedAt&language=en"
            f"&apiKey={self.news_api_key}"
        )
        r = requests.get(url, timeout=15)
        r.raise_for_status()
        articles = r.json().get("articles", [])
        return [{
            "title": a.get("title"), 
            "description": a.get("description"),
            "url": a.get("url"),
            "source": a.get("source"),
            "publishedAt": a.get("publishedAt")
        } for a in articles[:5]]

    def _tavily(self, query: str):
        if not self.tavily_api_key:
            raise ValueError("No Tavily API key configured")
        
        url = "https://api.tavily.com/search"
        payload = {
            "api_key": self.tavily_api_key,
            "query": f"latest stock market news {query}",
            "search_depth": "basic",
            "max_results": 5
        }
        
        r = requests.post(url, json=payload, timeout=15)
        r.raise_for_status()
        results = r.json().get("results", [])
        
        return [{
            "title": res.get("title"),
            "description": res.get("content"),
            "url": res.get("url"),
            "source": {"name": res.get("url", "").split("/")[2] if "/" in res.get("url", "") else "Tavily Search"},
            "publishedAt": datetime.now().isoformat()
        } for res in results]

    def _gnews(self, query: str):
        if not self.gnews_api_key:
            raise ValueError("No GNews API key configured")
        url = (
            f"https://gnews.io/api/v4/search"
            f"?q={query}&token={self.gnews_api_key}&lang=en&max=5"
        )
        r = requests.get(url, timeout=15)
        r.raise_for_status()
        articles = r.json().get("articles", [])
        return [{
            "title": a.get("title"), 
            "description": a.get("description"),
            "url": a.get("url"),
            "source": a.get("source"),
            "publishedAt": a.get("publishedAt")
        } for a in articles[:5]]


market_service = MarketService()
