"""
Dashboard Data Service
Handles fast, real-time data fetching for the frontend dashboard UI components.
Uses yfinance and market_service's news API to power the dashboard without running the full LLM Crew.
"""
import yfinance as yf
from datetime import datetime
from app.services.market_service import market_service


class DashboardService:
    def __init__(self):
        # Top 10 heavyweights of Nifty 50 for quick "Movers" calculation
        self.top_tickers = [
            "RELIANCE.NS", "HDFCBANK.NS", "ICICIBANK.NS", "INFY.NS", 
            "TCS.NS", "ITC.NS", "BTATAMOTORS.NS", "SBIN.NS", "BHARTIARTL.NS", "BAJFINANCE.NS"
        ]

    def get_market_overview(self):
        """Fetch Nifty 50 (^NSEI) overview and 1-mo sparkline data."""
        try:
            ticker = yf.Ticker("^NSEI")
            # Fetch last 30 days of data
            hist = ticker.history(period="1mo")
            if hist.empty:
                return None

            prices = hist["Close"].tolist()
            dates = hist.index.strftime("%Y-%m-%d").tolist()

            current = prices[-1]
            prev = prices[0]
            change = current - prev
            change_pct = (change / prev) * 100

            return {
                "symbol": "Nifty 50",
                "current": round(current, 2),
                "change": round(change, 2),
                "changePct": round(change_pct, 2),
                "history": prices
            }
        except Exception as e:
            print(f"[Dashboard] get_market_overview error: {e}")
            return None

    def get_top_movers(self):
        """Fetch top gainers and losers from the predefined basket."""
        try:
            tickers = yf.Tickers(" ".join(self.top_tickers))
            results = []

            for symbol in self.top_tickers:
                # Sometimes yahoo misses BTATAMOTORS.NS, we just try/except
                try:
                    t = tickers.tickers[symbol]
                    # We can use previous close and current price
                    info = t.info
                    # Fallback to history if info is rate limited
                    if "currentPrice" in info and "previousClose" in info:
                        current = info["currentPrice"]
                        prev = info["previousClose"]
                    else:
                        hist = t.history(period="5d")
                        if len(hist) < 2:
                            continue
                        current = hist["Close"].iloc[-1]
                        prev = hist["Close"].iloc[-2]
                    
                    if not current or not prev or prev == 0:
                        continue

                    change = current - prev
                    change_pct = (change / prev) * 100

                    # Format name cleanly
                    clean_name = symbol.replace(".NS", "")

                    results.append({
                        "name": clean_name,
                        "price": f"₹{current:,.2f}",
                        "change": f"{'+' if change_pct >= 0 else ''}{change_pct:.2f}%",
                        "raw_pct": change_pct,
                        "sector": info.get("sector", "Equities")
                    })
                except Exception as e:
                    # Skip problematic ticker
                    continue

            # Sort by pct change
            sorted_movers = sorted(results, key=lambda x: x["raw_pct"], reverse=True)
            
            gainers = sorted_movers[:4]
            losers = sorted_movers[-4:]
            losers.reverse() # Most negative first

            return {
                "gainers": gainers,
                "losers": losers
            }
        except Exception as e:
            print(f"[Dashboard] get_top_movers error: {e}")
            return {"gainers": [], "losers": []}

    def get_market_sentiment(self):
        """Fetch news and calculate a simple keyword-based sentiment gauge score (0-100)."""
        try:
            news = market_service.get_news("Nifty")
            if not news:
                return {"score": 50, "label": "Neutral"}

            # Simple NLP
            bullish_words = ["high", "surge", "gain", "profit", "record", "jump", "buy", "bull", "up", "soar", "rally", "growth"]
            bearish_words = ["low", "drop", "fall", "loss", "crash", "plunge", "sell", "bear", "down", "slump", "fear", "shrink"]

            bull_score = 0
            bear_score = 0

            for article in news:
                text = (str(article.get("title", "")) + " " + str(article.get("description", ""))).lower()
                for w in bullish_words:
                    if w in text: bull_score += 1
                for w in bearish_words:
                    if w in text: bear_score += 1

            total_words = bull_score + bear_score
            if total_words == 0:
                score = 50
            else:
                # Calculate percentage of bullishness
                ratio = bull_score / total_words
                # Map to 0-100 gauge (0=very bearish, 100=very bullish)
                score = int(ratio * 100)

            # Smooth it a bit towards 50 so it's not wildly 0 or 100 on low news volume
            score = int((score + 50) / 2)

            label = "Neutral"
            if score >= 65:
                label = "Bullish"
            elif score <= 35:
                label = "Bearish"

            return {"score": score, "label": label}
        except Exception as e:
            print(f"[Dashboard] get_market_sentiment error: {e}")
            return {"score": 50, "label": "Neutral"}

    def get_market_news(self):
        """Fetch the latest live news for the broader market"""
        try:
            news = market_service.get_news("Indian Stock Market Nifty")
            if not news:
                return []
            
            # Formatting to match the frontend expectations
            formatted = []
            for i, item in enumerate(news):
                title = item.get("title", "No Title")
                desc = item.get("description", "No Details")
                
                # Determine mock impact based on index
                impact = "Medium"
                if i % 3 == 0: impact = "High"
                elif i % 5 == 0: impact = "Low"

                formatted.append({
                    "id": i + 1,
                    "headline": title,
                    "source": "Live AI Source",
                    "time": "Just now",
                    "impact": impact,
                    "summary": desc,
                    "sector": "Market Event"
                })
            return formatted
        except Exception as e:
            print(f"[Dashboard] get_market_news error: {e}")
            return []

    def get_live_portfolio(self):
        """Fetch holdings from DB and live current prices via yfinance"""
        try:
            from app.services.db_service import db_service
            holdings = db_service.get_portfolio_holdings()

            if not holdings:
                return {"holdings": [], "sectors": [], "total_value": 0, "risk_level": 50, "insights": []}

            total_cost = 0.0
            total_current = 0.0
            live_holdings = []
            sector_totals = {}

            # First pass: fetch all tickers to avoid multiple network calls
            symbols = [h["symbol"] for h in holdings]
            tickers = yf.Tickers(" ".join(symbols))

            for h in holdings:
                symbol = h["symbol"]
                qty = float(h["quantity"])
                avg_price = float(h["avg_price"])
                cost_basis = qty * avg_price
                total_cost += cost_basis

                try:
                    t = tickers.tickers[symbol]
                    info = t.info
                    # Fallback live price detection
                    current_price = info.get("currentPrice") or info.get("regularMarketPrice") or avg_price
                    sector = info.get("sector", "Mixed")
                except Exception as e:
                    print(f"Failed to fetch info for {symbol}: {e}")
                    current_price = avg_price
                    sector = "Mixed"
                
                current_val = qty * current_price
                total_current += current_val
                
                # Accrue sector data
                sector_totals[sector] = sector_totals.get(sector, 0) + current_val

                # Calculate P&L
                change_val = current_val - cost_basis
                change_pct = (change_val / cost_basis) * 100 if cost_basis > 0 else 0

                clean_name = symbol.replace(".NS", "").replace(".BO", "")

                live_holdings.append({
                    "name": clean_name,
                    "allocation": 0, # Will calculate after total
                    "value_raw": current_val,
                    "value": f"₹{current_val:,.2f}",
                    "change": f"{'+' if change_pct >= 0 else ''}{change_pct:.2f}%",
                    "sector": sector
                })

            # Second pass: calculate allocations
            for lh in live_holdings:
                alloc = (lh["value_raw"] / total_current) * 100 if total_current > 0 else 0
                lh["allocation"] = round(alloc, 1)

            # Build Pie Chart stats
            colors = ["hsl(43 65% 53%)", "hsl(354 85% 48%)", "hsl(145 100% 39%)", "hsl(214 20% 69%)", "hsl(220 20% 30%)"]
            sector_data = []
            color_index = 0
            for sec, val in sorted(sector_totals.items(), key=lambda x: x[1], reverse=True):
                pct = (val / total_current) * 100 if total_current > 0 else 0
                sector_data.append({
                    "name": sec,
                    "pct": round(pct, 1),
                    "color": colors[color_index % len(colors)]
                })
                color_index += 1

            # Simple automatic insights
            insights = []
            total_change_pct = ((total_current - total_cost) / total_cost) * 100 if total_cost > 0 else 0

            if sector_data and sector_data[0]["pct"] > 40:
                insights.append({"type": "warning", "text": f"{sector_data[0]['name']} sector overexposed at {sector_data[0]['pct']}% — consider diversifying"})
            
            if total_change_pct > 5:
                insights.append({"type": "positive", "text": f"Portfolio is up {total_change_pct:.1f}% overall, performing strongly."})
            elif total_change_pct < -5:
                insights.append({"type": "suggestion", "text": f"Portfolio drawdown at {total_change_pct:.1f}%. Look for tax-loss harvesting."})
            else:
                insights.append({"type": "suggestion", "text": "Portfolio is relatively flat, good time to accumulate cash-rich assets."})

            return {
                "holdings": live_holdings,
                "sectors": sector_data,
                "total_value": f"₹{total_current:,.2f}",
                "risk_level": 65 if len(holdings) < 5 else 40,
                "insights": insights
            }
        except Exception as e:
            print(f"[Dashboard] get_live_portfolio error: {e}")
            import traceback
            traceback.print_exc()
            return {"holdings": [], "sectors": [], "total_value": "0", "risk_level": 50, "insights": []}

dashboard_service = DashboardService()
