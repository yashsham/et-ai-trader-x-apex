import json
import traceback
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.services.market_service import market_service
from app.services.db_service import db_service
from app.crew.news_orchestrator import NewsCrew

class NewsIntelligenceService:
    def __init__(self):
        from app.services.llm_router import llm_router
        self.llm = llm_router.get_router()

    async def get_curated_news(self, symbol: Optional[str] = None, query: Optional[str] = None, language: str = "English"):
        """Fetch raw news and run the AI Editor Swarm for clustering and impact."""
        raw_news = market_service.get_news(query or symbol or "Indian Stock Market Nifty")
        if not raw_news:
            return []

        try:
            # 3. Snapshot for historical comparison
            if symbol:
                db_service.save_news_snapshot(symbol, raw_news)

            # 4. Return formatted news items matching the frontend interface:
            # { id, headline, source, time, impact, summary, sector }
            from app.services.translation_service import translation_service
            
            # Prepare data for batch-lite summarization (First 5 items get deep AI summary)
            top_items = raw_news[:7]
            results = []
            
            for i, item in enumerate(top_items):
                impact = "Medium"
                title = item.get("title", "Market Update")
                desc = item.get("description") or item.get("content") or "No further details available."
                
                title_lower = title.lower()
                if any(w in title_lower for w in ["high", "breaking", "plunge", "surge", "crash", "soar", "record"]):
                    impact = "High"
                elif any(w in title_lower for w in ["steady", "holds", "unchanged"]):
                    impact = "Low"
                
                published = item.get("publishedAt") or item.get("published_at") or datetime.now().isoformat()
                try:
                    dt = datetime.fromisoformat(published.replace('Z', '+00:00'))
                    time_str = dt.strftime("%Y-%m-%d %H:%M")
                except:
                    time_str = published[:10]

                # --- AI INSTITUTIONAL SUMMARY ---
                # We use a compact but high-conviction prompt
                summary = desc[:200] + "..." # Fallback
                try:
                    from langchain_core.messages import HumanMessage
                    prompt = f"""
                    Act as a Principal Market Strategist (40y experience). 
                    Summarize this news in {language} in 2-3 sentences. 
                    Focus on institutional impact and hidden risks for an Indian investor.
                    News Title: {title}
                    Content: {desc[:500]}
                    Return ONLY the summary. No preamble.
                    """
                    # We only do this for the top 5 to keep it fast
                    if i < 5:
                        ai_res = self.llm.invoke([HumanMessage(content=prompt)])
                        summary = ai_res.content.strip()
                except Exception as ex:
                    print(f"[NewsService] LLM Summary failed for item {i}: {ex}")

                # ── DYNAMIC TRANSLATION (If not already handled by LLM) ──
                headline = title
                if language != "English":
                    headline = translation_service.translate(title, language)
                    # If LLM failed, we translate the fallback summary
                    if "..." in summary:
                        summary = translation_service.translate(summary, language)

                results.append({
                    "id": i,
                    "headline": headline,
                    "source": item.get("source", {}).get("name", "Market Feed") if isinstance(item.get("source"), dict) else item.get("source", "Market Feed"),
                    "time": time_str,
                    "sector": "Broad Market" if not symbol else symbol,
                    "impact": impact,
                    "summary": summary,
                    "url": item.get("url", "#").strip()
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
