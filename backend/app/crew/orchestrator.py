import json
import re
import logging
from crewai import Crew, Process
from app.agents.trading_agents import TradingAgents
from app.crew.tasks import TradingTasks
from app.services.db_service import db_service
from app.services.translation_service import translation_service

logger = logging.getLogger(__name__)


def _parse_trading_result(raw_text: str) -> dict:
    """
    3-tier bulletproof parser for LLM trading outputs.
    Tier 1: Direct JSON parse (handles clean outputs)
    Tier 2: Regex field extraction (handles JSON embedded in prose)
    Tier 3: Keyword heuristic (handles plain-text outputs)
    """
    result = {
        "decision": "HOLD",
        "entry": "See reasoning below",
        "target": "See reasoning below",
        "stop_loss": "See reasoning below",
        "confidence": 75.0,
        "reasoning": raw_text
    }

    # === TIER 1: Try clean JSON parse ===
    try:
        # Strip markdown code fences if present
        clean = re.sub(r"```(?:json)?|```", "", raw_text).strip()
        # Find first JSON object
        json_match = re.search(r"\{[\s\S]*?\}", clean, re.DOTALL)
        if json_match:
            parsed = json.loads(json_match.group(0))
            if "decision" in parsed:
                result.update({
                    "decision": str(parsed.get("decision", "HOLD")).upper(),
                    "entry": str(parsed.get("entry", result["entry"])),
                    "target": str(parsed.get("target", result["target"])),
                    "stop_loss": str(parsed.get("stop_loss", result["stop_loss"])),
                    "confidence": float(parsed.get("confidence", 75.0)),
                    "reasoning": str(parsed.get("reasoning", raw_text))
                })
                logger.info("[Parser] Tier 1 SUCCESS: JSON parsed cleanly.")
                return result
    except Exception as e:
        logger.warning(f"[Parser] Tier 1 FAIL: {e}")

    # === TIER 2: Regex field extraction ===
    try:
        def rex(pattern, text, default=None):
            m = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            return m.group(1).strip() if m else default

        decision_match = rex(r'"?decision"?\s*[:=]\s*"?([A-Z]+)"?', raw_text) or \
                         rex(r'\b(BUY|SELL|HOLD)\b', raw_text)
        entry_match    = rex(r'"?entry"?\s*[:=]\s*"([^"]+)"', raw_text) or \
                         rex(r'[Ee]ntry\s*(?:Zone|Price|Level|Point)?[:\-]\s*(Rs\.?\s*[\d,.\-\s]+)', raw_text)
        target_match   = rex(r'"?target"?\s*[:=]\s*"([^"]+)"', raw_text) or \
                         rex(r'[Tt]arget\s*(?:Price|Level)?[:\-]\s*(Rs\.?\s*[\d,.\-\s]+)', raw_text)
        sl_match       = rex(r'"?stop_loss"?\s*[:=]\s*"([^"]+)"', raw_text) or \
                         rex(r'[Ss]top[\s_-][Ll]oss[:\-]\s*(Rs\.?\s*[\d,.\-\s]+)', raw_text)
        conf_match     = rex(r'"?confidence"?\s*[:=]\s*([\d.]+)', raw_text)
        reasoning_match= rex(r'"?reasoning"?\s*[:=]\s*"([^"]{30,})"', raw_text)

        if decision_match:
            result["decision"] = decision_match.upper()
        if entry_match:
            result["entry"] = entry_match
        if target_match:
            result["target"] = target_match
        if sl_match:
            result["stop_loss"] = sl_match
        if conf_match:
            result["confidence"] = float(conf_match)
        if reasoning_match:
            result["reasoning"] = reasoning_match

        if decision_match:
            logger.info("[Parser] Tier 2 SUCCESS: Regex extracted fields.")
            return result
    except Exception as e:
        logger.warning(f"[Parser] Tier 2 FAIL: {e}")

    # === TIER 3: Keyword heuristic ===
    upper = raw_text.upper()
    if "BUY" in upper and "SELL" not in upper:
        result["decision"] = "BUY"
    elif "SELL" in upper:
        result["decision"] = "SELL"
    else:
        result["decision"] = "HOLD"
    result["reasoning"] = raw_text
    logger.info("[Parser] Tier 3 FALLBACK: Keyword heuristic used.")
    return result


class TradingCrew:
    def __init__(self, symbol: str, portfolio: dict, language: str = "English"):
        self.symbol = symbol
        self.portfolio = portfolio
        self.agents = TradingAgents(language=language)
        self.tasks = TradingTasks()
        self.language = language

    async def run(self):
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

        crew = Crew(
            agents=[data_agent, signal_agent, sentiment_agent, portfolio_agent, decision_agent],
            tasks=[data_task, signal_task, sentiment_task, portfolio_task, decision_task],
            process=Process.sequential,
            verbose=True
        )

        crew_result = await crew.kickoff_async()
        raw_text = str(crew_result)

        # ── MULTI-STRATEGY PARSER ──
        final_data = _parse_trading_result(raw_text)

        # ── TRANSLATION LAYER ──
        if self.language != "English":
            reasoning = final_data.get("reasoning", "")
            if reasoning:
                final_data["reasoning"] = translation_service.translate(reasoning, self.language)

        # Persist to Supabase (Non-blocking)
        try:
            db_service.save_analysis(
                symbol=self.symbol,
                decision_output=json.dumps(final_data),
                portfolio=self.portfolio,
            )
        except Exception as e:
            logger.warning(f"[TradingCrew] DB save failed (non-critical): {e}")

        # ── ENSURE FRONTEND COMPATIBILITY ──
        # Return a flat, highly compatible payload
        return {
            "parsed_data": final_data,
            **final_data,
            "status": "success",
            "confidence": final_data.get("confidence", 0.85)
        }
