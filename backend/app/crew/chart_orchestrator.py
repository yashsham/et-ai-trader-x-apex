from crewai import Crew, Process, Task
from app.agents.trading_agents import TradingAgents
from app.core.response_normalizer import response_normalizer
import json

class ChartCrew:
    def __init__(self, symbol: str, technical_context: dict, language: str = "English"):
        self.symbol = symbol
        self.technical_context = technical_context
        self.language = language
        self.agents = TradingAgents(language=language)

    def run(self):
        # Initialize specialized agents
        indicator_specialist = self.agents.indicator_agent()
        pattern_expert = self.agents.pattern_agent()
        trade_architect = self.agents.risk_reward_agent()
        educator = self.agents.explanation_agent()

        # Task 1: Indicator Analysis
        indicator_task = Task(
            description=(
                f"Analyze the following technical indicators for {self.symbol}: "
                f"{json.dumps(self.technical_context)}. "
                "Identify if the stock is overbought/oversold and if there's a momentum crossover."
            ),
            expected_output="A summary of RSI, MACD, and EMA alignment (Bullish/Bearish/Neutral).",
            agent=indicator_specialist
        )

        # Task 2: Pattern Recognition
        pattern_task = Task(
            description=(
                f"Look at the recent price action for {self.symbol}. "
                "Detect if we are in a breakout, reversal, or consolidation phase. "
                "Identify any specific candlestick patterns like Engulfing, Hammer, or Doji."
            ),
            expected_output="Identification of the current chart pattern and its reliability score.",
            agent=pattern_expert
        )

        # Task 3: Risk/Reward Architecture
        risk_task = Task(
            description=(
                f"Based on the indicators and patterns, design a trade setup for {self.symbol}. "
                "Determine the exact Target, Stop Loss, and Risk:Reward ratio. "
                "Specify the 'Entry Zone' clearly."
            ),
            expected_output="JSON with 'target', 'stop_loss', 'entry_zone', and 'risk_reward_ratio'.",
            agent=trade_architect
        )

        # Task 4: Expert Synthesis & Output
        explanation_task = Task(
            description=(
                "Synthesize all technical findings, pattern recognitions, and risk architectures. "
                "Provide a 1-2 paragraph expert Hinglish reasoning in the 'explanation' field. "
                "Combine all data into a FINAL JSON object. "
                "FORMAT: {\"trend\": \"Bullish/Bearish/Neutral\", \"explanation\": \"...\", \"target\": float, \"stop_loss\": float, \"risk_reward\": \"string\", \"resistance\": float, \"support\": float}"
            ),
            expected_output="A complete JSON object for the Chart Intelligence UI.",
            agent=educator
        )

        crew = Crew(
            agents=[indicator_specialist, pattern_expert, trade_architect, educator],
            tasks=[indicator_task, pattern_task, risk_task, explanation_task],
            process=Process.sequential,
            verbose=True
        )

        try:
            result = crew.kickoff()
            raw_result = str(result)
            print(f"[ChartCrew] Raw result from kickoff: {raw_result}")
            
            # Normalize for internal schema
            normalized = response_normalizer.normalize(raw_result, symbol=self.symbol, source="ChartIntelligence")
            
            # ── DEDICATED TRANSLATION LAYER ──
            if self.language != "English" and isinstance(normalized.data, dict):
                from app.services.translation_service import translation_service
                explanation = normalized.data.get("explanation")
                if explanation:
                    translated = translation_service.translate(explanation, self.language)
                    normalized.data["explanation"] = translated

            return normalized.model_dump()
        except Exception as e:
            import traceback
            print(f"[ChartCrew] CRITICAL ERROR during kickoff or normalization:")
            traceback.print_exc()
            raise

