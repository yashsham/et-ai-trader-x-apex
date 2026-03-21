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
            print(f"[ChartCrew] Raw result: {raw_result[:200]}")

            # ── ROBUST 3-TIER PARSER ──
            import re

            analysis = {
                "trend": "Neutral",
                "explanation": raw_result,
                "target": technical_context["levels"]["resistance"],
                "stop_loss": technical_context["levels"]["support"],
                "resistance": technical_context["levels"]["resistance"],
                "support": technical_context["levels"]["support"],
                "risk_reward": "1:1.5"
            }

            # Tier 1: JSON parse
            try:
                clean = re.sub(r"```(?:json)?|```", "", raw_result).strip()
                jm = re.search(r"\{[\s\S]*\}", clean, re.DOTALL)
                if jm:
                    parsed = json.loads(jm.group(0))
                    if any(k in parsed for k in ["trend", "target", "explanation"]):
                        analysis.update({
                            "trend": parsed.get("trend", analysis["trend"]),
                            "explanation": parsed.get("explanation", analysis["explanation"]),
                            "target": float(parsed.get("target") or analysis["target"]),
                            "stop_loss": float(parsed.get("stop_loss") or analysis["stop_loss"]),
                            "resistance": float(parsed.get("resistance") or analysis["resistance"]),
                            "support": float(parsed.get("support") or analysis["support"]),
                            "risk_reward": parsed.get("risk_reward", analysis["risk_reward"])
                        })
                        print("[ChartCrew] Tier 1 SUCCESS")
            except Exception as e1:
                print(f"[ChartCrew] Tier 1 fail: {e1}")
                # Tier 2: Regex extraction
                try:
                    def rex(p, t, default=None):
                        m = re.search(p, t, re.IGNORECASE)
                        return m.group(1).strip() if m else default

                    trend = rex(r'"?trend"?\s*[:=]\s*"?([A-Za-z\s]+)"?', raw_result)
                    if trend: analysis["trend"] = trend.strip()
                    expl = rex(r'"?explanation"?\s*[:=]\s*"([^"]{20,})"', raw_result)
                    if expl: analysis["explanation"] = expl
                    tgt = rex(r'"?target"?\s*[:=]\s*([\d.]+)', raw_result)
                    if tgt: analysis["target"] = float(tgt)
                    sl = rex(r'"?stop_loss"?\s*[:=]\s*([\d.]+)', raw_result)
                    if sl: analysis["stop_loss"] = float(sl)
                    rr = rex(r'"?risk_reward"?\s*[:=]\s*"?([0-9:\.]+)"?', raw_result)
                    if rr: analysis["risk_reward"] = rr
                    print("[ChartCrew] Tier 2 SUCCESS")
                except Exception as e2:
                    print(f"[ChartCrew] Tier 2 fail: {e2}")

            # ── TRANSLATION ──
            if self.language != "English":
                from app.services.translation_service import translation_service
                analysis["explanation"] = translation_service.translate(
                    analysis["explanation"], self.language
                )

            return {"status": "success", "data": analysis}

        except Exception as e:
            import traceback
            print(f"[ChartCrew] CRITICAL ERROR:")
            traceback.print_exc()
            raise

