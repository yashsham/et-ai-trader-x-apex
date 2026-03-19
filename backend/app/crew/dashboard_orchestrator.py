from crewai import Crew, Process, Task
from app.agents.trading_agents import TradingAgents
from app.core.response_normalizer import response_normalizer
import json

class DashboardCrew:
    def __init__(self, context_data: dict):
        """
        context_data contains:
        - overview: index status
        - movers: gainers/losers
        - sentiment: news sentiment
        - news: headlines
        - watchlist: watchlist status
        """
        self.context_data = context_data
        self.agents = TradingAgents()

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
                "Synthesize it into a sharp 'Executive Focus' summary for the user. "
                "Highlight the single most important 'Priority Action' (e.g., 'Watch for Nifty breakdown', 'IT sector rallying'). "
                "Keep it professional, ultra-concise, and actionable."
            ),
            expected_output=(
                "A JSON object with two fields: "
                "'summary': (2-3 sentences of insight), "
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
        
        # Normalize
        normalized = response_normalizer.normalize(raw_result, source="DashboardCrew")
        return normalized.model_dump()
