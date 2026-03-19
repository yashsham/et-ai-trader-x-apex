from crewai import Crew, Process, Task
from app.agents.trading_agents import TradingAgents
from app.core.response_normalizer import response_normalizer
import json

class PortfolioCrew:
    def __init__(self, portfolio_data: dict):
        self.portfolio_data = portfolio_data
        self.agents = TradingAgents()

    def run(self):
        # Initialize specialized agents
        allocation_expert = self.agents.allocation_agent()
        risk_manager = self.agents.risk_agent()
        diversifier = self.agents.diversification_agent()
        decision_maker = self.agents.decision_agent()
        educator = self.agents.explanation_agent()

        # Task 1: Allocation Analysis
        allocation_task = Task(
            description=(
                f"Analyze the following portfolio data: {json.dumps(self.portfolio_data)}. "
                "Calculate the percentage of total value held in each sector and identify any single stock "
                "that accounts for more than 20% of the total portfolio value."
            ),
            expected_output="A breakdown of sector weightings and a list of 'Heavyweight' stocks.",
            agent=allocation_expert
        )

        # Task 2: Risk Assessment
        risk_task = Task(
            description=(
                "Given the allocation data, determine the overall Portfolio Risk Score (1-100). "
                "Evaluate the impact of a 10% market correction on this specific portfolio configuration."
            ),
            expected_output="Risk score with 3 specific reasons (e.g., 'High Beta', 'Sector Overexposure').",
            agent=risk_manager
        )

        # Task 3: Diversification & Rebalancing
        rebalance_task = Task(
            description=(
                "Identify gaps in the portfolio. Suggest 2-3 specific buy or sell actions to achieve a "
                "more balanced risk-adjusted return. Explain why these changes are necessary."
            ),
            expected_output="List of suggested actions with 'Buy/Sell/Hold', 'Symbol', and 'Rationale'.",
            agent=diversifier
        )

        # Task 4: Executive Recommendation
        decision_task = Task(
            description=(
                "Synthesize all findings into a final 'Portfolio Health' status. "
                "Assign a 'diversification_score' and provide a priority list of 'Trade Ready' rebalancing steps."
            ),
            expected_output="JSON with 'health_status', 'diversification_score', and 'rebalancing_plan[].",
            agent=decision_maker
        )

        # Task 5: Multi-Language Coaching
        explanation_task = Task(
            description=(
                f"Write a professional yet encouraging explanation of the portfolio's status in {self.language}. "
                "Tell the user exactly what to do next to sleep better at night regarding their investments."
            ),
            expected_output=f"2 paragraphs of {self.language} reasoning with a 'Next Steps' summary.",
            agent=educator
        )

        crew = Crew(
            agents=[allocation_expert, risk_manager, diversifier, decision_maker, educator],
            tasks=[allocation_task, risk_task, rebalance_task, decision_task, explanation_task],
            process=Process.sequential,
            verbose=True
        )

        result = crew.kickoff()
        raw_result = str(result)
        
        # Normalize for internal schema
        normalized = response_normalizer.normalize(raw_result, symbol="PORTFOLIO", source="PortfolioBrain")
        return normalized.model_dump()
