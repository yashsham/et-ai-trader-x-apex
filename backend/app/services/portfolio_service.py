import json
import traceback
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.services.market_service import market_service
from app.services.db_service import db_service
from app.crew.portfolio_orchestrator import PortfolioCrew

# Re-use a common pool for IO tasks
_IO_POOL = ThreadPoolExecutor(max_workers=20, thread_name_prefix="portfolio_io")

class PortfolioBrainService:
    def __init__(self):
        pass

    def get_portfolio_summary(self, user_id: str = "default_user"):
        """Get live valuation for all holdings and basic allocation stats with 30s cache."""
        cache_key = f"portfolio_summary_{user_id}"
        from app.services.cache_service import cache_service
        cached = cache_service.get(cache_key)
        if cached:
            print(f"[Portfolio] Using cached summary for {user_id}")
            return cached

        holdings = db_service.get_portfolio_holdings(user_id)
        if not holdings:
            return self._empty_portfolio_response()

        total_value = 0
        total_pnl = 0
        enriched_holdings = []
        sector_map = {}

        # 1. Parallel Fetch all prices
        symbols = list(set(h["symbol"] for h in holdings))
        
        # Strategy: Use batch fetch for efficiency
        batch_prices = market_service.get_stock_data_batch(symbols)
        
        # Build price map
        price_map = {}
        for sym in symbols:
            if sym in batch_prices:
                price_map[sym] = batch_prices[sym]
            else:
                try:
                    live_data = market_service.get_stock_data(sym)
                    price_map[sym] = live_data.get("current_price") or 0
                except:
                    price_map[sym] = 0

        # ... (rest of processing)
        for h in holdings:
            symbol = h["symbol"]
            qty = h["quantity"]
            avg_price = h["avg_price"]
            current_price = price_map.get(symbol) or avg_price

            value = qty * current_price
            pnl = (current_price - avg_price) * qty
            pnl_pct = ((current_price / avg_price) - 1) * 100 if avg_price > 0 else 0
            
            total_value += value
            total_pnl += pnl

            sector = h.get("sector") or "Equity"
            sector_map[sector] = sector_map.get(sector, 0) + value

            enriched_holdings.append({
                "id": h["id"],
                "symbol": symbol,
                "quantity": qty,
                "avg_price": avg_price,
                "current_price": round(current_price, 2),
                "value": round(value, 2),
                "pnl": round(pnl, 2),
                "pnl_pct": round(pnl_pct, 2),
                "sector": sector
            })

        # Calculate Percentages
        for h in enriched_holdings:
            h["allocation"] = round((h["value"] / total_value) * 100, 2) if total_value > 0 else 0
            h["name"] = h["symbol"]
            h["value_raw"] = h["value"]
            h["value"] = f"₹{h['value']:,}"
            h["change"] = f"{h['pnl_pct']:+.2f}%"

        sectors = []
        colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
        for i, (name, val) in enumerate(sector_map.items()):
            sectors.append({
                "name": name,
                "pct": round((val / total_value) * 100, 2) if total_value > 0 else 0,
                "color": colors[i % len(colors)]
            })

        # Default insights
        default_insights = [
            {"type": "suggestion", "text": "AI Optimization will unlock deeper diversification insights."},
            {"type": "positive", "text": "Portfolio tracking is active and syncing with live market data."}
        ]

        result = {
            "total_value": f"₹{total_value:,.2f}",
            "total_value_raw": total_value,
            "total_pnl": round(total_pnl, 2),
            "pnl_pct": round((total_pnl / (total_value - total_pnl)) * 100, 2) if (total_value - total_pnl) > 0 else 0,
            "holdings": enriched_holdings,
            "sectors": sectors,
            "risk_level": 45,
            "insights": default_insights,
            "last_updated": datetime.now().isoformat()
        }
        
        # Cache for 30s
        cache_service.set(cache_key, result, expire_seconds=30)
        return result

    async def analyze_portfolio(self, user_id: str = "default_user", language: str = "English"):
        """Trigger AI Portfolio Optimization Swarm."""
        import asyncio
        from concurrent.futures import ThreadPoolExecutor
        
        summary = self.get_portfolio_summary(user_id)
        if not summary["holdings"]:
            return {"error": "Portfolio is empty", "status": "No Holdings"}

        try:
            loop = asyncio.get_event_loop()
            with ThreadPoolExecutor() as pool:
                # Wrap the synchronous crew run in an executor
                result = await loop.run_in_executor(pool, lambda: PortfolioCrew(summary, language=language).run())
                
            ai_data = result.get("data", {}) if result else {}
            
            # Map AI data to frontend interface
            div_score = ai_data.get("diversification_score", 50)
            summary["risk_level"] = max(10, min(95, 100 - div_score))
            
            ai_insights = []
            if ai_data.get("health_status"):
                ai_insights.append({"type": "positive" if div_score > 70 else "warning", "text": f"Portfolio Health: {ai_data['health_status']}"})
            
            rebalancing = ai_data.get("rebalancing_plan", [])
            for plan in rebalancing[:2]: # Top 2 rebalancing steps as insights
                ai_insights.append({"type": "suggestion", "text": f"Action: {plan.get('Symbol')} -> {plan.get('Rationale')}"})
            
            if not ai_insights:
                ai_insights.append({"type": "positive", "text": "Portfolio is well-balanced according to AI swarm metrics."})
            
            summary["insights"] = ai_insights
            return summary
        except Exception as e:
            print(f"[PortfolioBrain] AI Analysis failed: {e}")
            return summary

    def _empty_portfolio_response(self):
        return {
            "total_value": 0,
            "total_pnl": 0,
            "pnl_pct": 0,
            "holdings": [],
            "sectors": [],
            "last_updated": datetime.now().isoformat(),
            "analysis": {
                "health_status": "Empty Portfolio",
                "explanation": "Add symbols to your portfolio to see AI-driven rebalancing insights."
            }
        }

    # CRUD Proxies
    def add_holding(self, symbol: str, quantity: float, avg_price: float, sector: str = "Other"):
        return db_service.add_portfolio_holding({
            "user_id": "default_user",
            "symbol": symbol.upper(),
            "quantity": quantity,
            "avg_price": avg_price,
            "sector": sector
        })

    def remove_holding(self, holding_id: str):
        return db_service.remove_portfolio_holding(holding_id)

portfolio_brain_service = PortfolioBrainService()
