from crewai import Crew, Process
from app.agents.trading_agents import TradingAgents
from app.crew.tasks import TradingTasks
from app.services.market_service import market_service
from app.services.signal_service import signal_service
from app.services.db_service import db_service
from app.core.response_normalizer import response_normalizer
import json

class TradingCrew:
    def __init__(self, symbol: str, portfolio: dict):
        self.symbol = symbol
        self.portfolio = portfolio
        self.agents = TradingAgents()
        self.tasks = TradingTasks()

    def run(self):
        # Initialize Agents
        data_agent = self.agents.data_agent()
        signal_agent = self.agents.signal_agent()
        sentiment_agent = self.agents.sentiment_agent()
        portfolio_agent = self.agents.portfolio_agent()
        decision_agent = self.agents.decision_agent()

        # Initialize Tasks
        data_task = self.tasks.data_task(data_agent, self.symbol)
        signal_task = self.tasks.signal_task(signal_agent, self.symbol)
        sentiment_task = self.tasks.sentiment_task(sentiment_agent, self.symbol)
        portfolio_task = self.tasks.portfolio_task(portfolio_agent, self.symbol, self.portfolio)
        decision_task = self.tasks.decision_task(decision_agent, self.symbol)

        # Context passing is handled by CrewAI sequence
        crew = Crew(
            agents=[data_agent, signal_agent, sentiment_agent, portfolio_agent, decision_agent],
            tasks=[data_task, signal_task, sentiment_task, portfolio_task, decision_task],
            process=Process.sequential,
            verbose=True
        )

        result = crew.kickoff()

        # Normalize result using our shared utility
        raw_result = str(result)
        normalized = response_normalizer.normalize(raw_result, source="TradingCrew")

        # ── ENSURE FRONTEND COMPATIBILITY ──
        # If the normalized data is a dict (JSON), wrap it in 'parsed_data' 
        # so the frontend's data.parsed_data.decision logic works correctly.
        final_data = normalized.data
        if isinstance(final_data, dict) and "parsed_data" not in final_data:
            normalized.data = {"parsed_data": final_data}

        # Persist analysis result to Supabase
        db_service.save_analysis(
            symbol=self.symbol,
            decision_output=raw_result,
            portfolio=self.portfolio,
        )

        # Return standardized struct
        return normalized.model_dump()

