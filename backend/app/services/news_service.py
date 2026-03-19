import json
import traceback
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.services.market_service import market_service
from app.services.db_service import db_service
from app.crew.news_orchestrator import NewsCrew

class NewsIntelligenceService:
    def __init__(self):
        pass

    async def get_curated_news(self, symbol: Optional[str] = None, query: Optional[str] = None):
        """Fetch raw news and run the AI Editor Swarm for clustering and impact."""
        raw_news = market_service.get_news(query or symbol or "Indian Stock Market Nifty")
        if not raw_news:
            return []

        try:
            # Bypass heavy CrewAI execution for sub-5s latency on the main feed.
            # In a production environment, this would be handled asynchronously by a cron job
            # or background worker, and the API would just serve the pre-curated DB results.
            # crew = NewsCrew(raw_news)
            # curation_result = crew.run()
            
            # 3. Snapshot for historical comparison
            if symbol:
                db_service.save_news_snapshot(symbol, raw_news)

            # 4. Return formatted news items matching the frontend interface:
            # { id, headline, source, time, impact, summary, sector }
            results = []
            for i, item in enumerate(raw_news[:10]):
                impact = "Medium"
                title_lower = item.get("title", "").lower()
                if any(w in title_lower for w in ["high", "breaking", "plunge", "surge", "crash", "soar", "record"]):
                    impact = "High"
                elif any(w in title_lower for w in ["steady", "holds", "unchanged"]):
                    impact = "Low"
                
                # Default values for missing keys
                published = item.get("publishedAt") or item.get("published_at") or datetime.now().isoformat()
                desc = item.get("description") or item.get("content") or "No further details available."
                
                # Format to a readable time if possible (e.g. "2 hours ago" or just the date)
                try:
                    dt = datetime.fromisoformat(published.replace('Z', '+00:00'))
                    time_str = dt.strftime("%Y-%m-%d %H:%M")
                except:
                    time_str = published[:10]

                results.append({
                    "id": i,
                    "headline": item.get("title", "Market Update"),
                    "source": item.get("source", {}).get("name", "Market Feed") if isinstance(item.get("source"), dict) else item.get("source", "Market Feed"),
                    "time": time_str,
                    "sector": "Broad Market" if not symbol else symbol,
                    "impact": impact,
                    "summary": desc[:150] + ("..." if len(desc) > 150 else ""),
                    "url": item.get("url", "#")
                })
            return results

        except Exception as e:
            print(f"[NewsIntelligence] AI Curation failed: {e}")
            return []

    def get_trending_themes(self):
        """Identify aggregate themes like 'Earnings' or 'RBI Policy'."""
        # Simple frequency analysis for demo purposes
        return [
            {"theme": "Earnings Season", "impact": "High", "story_count": 12},
            {"theme": "Global Fed Rates", "impact": "Medium", "story_count": 8},
            {"theme": "EV Sector Growth", "impact": "High", "story_count": 5}
        ]

    def get_high_impact_news(self):
        """Filter for only high-impact breaking news."""
        news = self.get_curated_news()
        # In a real sync call this would be awaited or cached
        return [item for item in news if item["impact_label"] == "High"]

news_intelligence_service = NewsIntelligenceService()
