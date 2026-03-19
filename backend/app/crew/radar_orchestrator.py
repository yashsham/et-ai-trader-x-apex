from crewai import Crew, Process, Task
from app.agents.trading_agents import TradingAgents
from app.core.response_normalizer import response_normalizer
import json

class RadarCrew:
    def __init__(self, symbol: str, technical_context: dict = None):
        self.symbol = symbol
        self.technical_context = technical_context or {}
        self.agents = TradingAgents()

    def run(self):
        # Initialize specialized agents
        catalyst_detective = self.agents.catalyst_agent()
        risk_manager = self.agents.risk_agent()
        decision_maker = self.agents.decision_agent()
        educator = self.agents.explanation_agent()

        # Define Radar Tasks
        # Task 1: Catalyst Detection
        catalyst_task = Task(
            description=(
                f"Analyze recent news and sector trends for {self.symbol}. "
                "Look for management changes, earnings surprises, or major order wins. "
                "Determine the 'primary catalyst' driving interest in this stock."
            ),
            expected_output="A list of 2-3 specific catalysts with their projected duration (Short/Medium/Long term).",
            agent=catalyst_detective
        )

        # Task 2: Risk & Levels
        risk_task = Task(
            description=(
                f"Given the technical data {json.dumps(self.technical_context)}, "
                f"determine the volatility-adjusted risk for {self.symbol}. "
                "Define the 'Invalidation Zone' (Stop Loss) and calculate an expected move percentage."
            ),
            expected_output="JSON with 'range_low', 'range_high', 'stop_loss', 'risk_score' (1-10), and 'expected_move_pct'.",
            agent=risk_manager
        )

        # Task 3: Synthesis & Conviction
        decision_task = Task(
            description=(
                f"Combine technical context and catalysts to generate a high-conviction signal for {self.symbol}. "
                "Assign a 'confidence' score (0-100) and decide if it's 'trade_ready' and 'high_conviction'. "
            ),
            expected_output=(
                "JSON with: 'signal_type' (BUY/SELL/HOLD), 'confidence', 'target', "
                "'high_conviction' (bool), 'trade_ready' (bool)."
            ),
            agent=decision_maker
        )

        # Task 4: Hinglish Explanation
        explanation_task = Task(
            description=(
                "Take all the findings and write a short, punchy explanation in Hinglish. "
                "Explain 'Why this stock?', 'Why now?', and 'Where to exit?'. "
                "Make it feel like a professional mentor speaking to a student."
            ),
            expected_output="2-3 paragraphs of Hinglish reasoning with a clear summary line.",
            agent=educator
        )

        crew = Crew(
            agents=[catalyst_detective, risk_manager, decision_maker, educator],
            tasks=[catalyst_task, risk_task, decision_task, explanation_task],
            process=Process.sequential,
            verbose=True
        )

        result = crew.kickoff()
        raw_result = str(result)
        
        # Normalize for internal schema
        normalized = response_normalizer.normalize(raw_result, symbol=self.symbol, source="OpportunityRadar")
        return normalized.model_dump()
