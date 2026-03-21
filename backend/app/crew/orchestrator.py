from crewai import Crew, Process
from app.agents.trading_agents import TradingAgents
from app.crew.tasks import TradingTasks
from app.services.market_service import market_service
from app.services.signal_service import signal_service
from app.services.db_service import db_service
from app.services.translation_service import translation_service
import json

class TradingCrew:
    def __init__(self, symbol: str, portfolio: dict, language: str = "English"):
        self.symbol = symbol
        self.portfolio = portfolio
        self.agents = TradingAgents(language=language)
        self.tasks = TradingTasks()
        self.language = language

    def run(self):
        # Initialize Agents
        manager = self.agents.manager_agent()
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
            process=Process.hierarchical,
            manager_agent=manager,
            memory=True,
            cache=True,
            verbose=True
        )

        result = crew.kickoff()

        # ── EXTRACT STRUCTURED DATA ──
        # result.pydantic is populated when output_pydantic is used in the final task
        if hasattr(result, 'pydantic') and result.pydantic:
            final_data = result.pydantic.dict()
        else:
            # Fallback for manual parsing
            from app.core.response_normalizer import response_normalizer
            normalized = response_normalizer.normalize(str(result), source="TradingCrew")
            final_data = normalized.data
        
        # ── DEDICATED TRANSLATION LAYER ──
        if self.language != "English":
            reasoning = final_data.get("reasoning")
            if reasoning:
                translated_reasoning = translation_service.translate(reasoning, self.language)
                final_data["reasoning"] = translated_reasoning

        # ── ENSURE FRONTEND COMPATIBILITY ──
        # The frontend expects parsed_data OR direct fields
        output_payload = {"parsed_data": final_data, **final_data}

        # Persist analysis result to Supabase
        db_service.save_analysis(
            symbol=self.symbol,
            decision_output=json.dumps(final_data),
            portfolio=self.portfolio,
        )

        return {"status": "success", "data": output_payload, "confidence": final_data.get("confidence")}

