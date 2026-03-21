from crewai import Crew, Process, Task
from app.agents.trading_agents import TradingAgents
from app.core.response_normalizer import response_normalizer
import json

class DashboardCrew:
    def __init__(self, context_data: dict, language: str = "English"):
        """
        context_data contains:
        - overview: index status
        - movers: gainers/losers
        - sentiment: news sentiment
        - news: headlines
        - watchlist: watchlist status
        """
        self.context_data = context_data
        self.language = language
        self.agents = TradingAgents(language=language)

    def run(self):
        # 1. Initialize summary agent
        exec_agent = self.agents.dashboard_decision_agent()

        # 2. Define the single synthesis task
        # Instead of running 6 agents (too slow for dashboard), we use the context fetched from services
        # and use ONE agent to synthesize it. This is "low-latency" as requested.
        
        context_str = json.dumps(self.context_data)
        
        task = Task(
            description=(
                f"Analyze this real-time market data: {context_str}. "
                f"Synthesize it into a sharp 'Executive Focus' summary in {self.language} for the user. "
                "Highlight the single most important 'Priority Action' (e.g., 'Watch for Nifty breakdown', 'IT sector rallying'). "
                "Keep it professional, ultra-concise, and actionable."
            ),
            expected_output=(
                "A JSON object with two fields: "
                f"'summary': (2-3 sentences of insight in {self.language}), "
                "'priority_action': (A short string like 'WATCH_BREAKOUT' or 'ACCUMULATE_GAINERS')"
            ),
            agent=exec_agent
        )

        crew = Crew(
            agents=[exec_agent],
            tasks=[task],
            process=Process.sequential,
            verbose=False
        )

        result = crew.kickoff()
        raw_result = str(result)

        # ── DYNAMIC TRANSLATION ──
        # Provide a high-quality machine translation bridge if needed
        if self.language != "English":
            from app.services.translation_service import translation_service
            # We translate the normalized summary later, or we can do it here.
            # Let's normalize first.
        
        # Normalize
        normalized = response_normalizer.normalize(raw_result, source="DashboardCrew")
        
        # ── APPLY TRANSLATION TO SUMMARY ──
        if self.language != "English" and isinstance(normalized.data, dict):
            summary = normalized.data.get("summary")
            if summary:
                from app.services.translation_service import translation_service
                normalized.data["summary"] = translation_service.translate(summary, self.language)

        return normalized.model_dump()
