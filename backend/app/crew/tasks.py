from crewai import Task

class TradingTasks:
    def data_task(self, agent, symbol):
        return Task(
            description=f"Collect real-time price, volume, and news for {symbol}. Return a structured summary.",
            agent=agent,
            expected_output="A structured summary of price action and recent news headlines."
        )

    def signal_task(self, agent, symbol):
        return Task(
            description=f"Analyze the technical data for {symbol}. Identify if there's a breakout or trend reversal.",
            agent=agent,
            expected_output="Technical signal (Breakout, Oversold, etc.) and confidence score."
        )

    def sentiment_task(self, agent, symbol):
        return Task(
            description=f"Analyze the mood around {symbol} based on news titles. Is it bullish or bearish?",
            agent=agent,
            expected_output="Sentiment score and qualitative assessment."
        )

    def portfolio_task(self, agent, symbol, portfolio):
        return Task(
            description=f"Assess how adding {symbol} impacts this portfolio: {portfolio}. Check risk-reward.",
            agent=agent,
            expected_output="Portfolio impact analysis and risk-adjusted recommendation."
        )

    def decision_task(self, agent, symbol):
        return Task(
            description=(
                f"You are the final decision maker. Based on all prior analysis, "
                f"provide a definitive BUY, SELL, or HOLD recommendation for {symbol}. "
                f"You MUST return a single valid JSON object and NOTHING ELSE — no preamble, no explanation outside JSON. "
                f"Use REAL price levels based on the research provided.\n\n"
                f"Required JSON format (fill in real values):\n"
                f'{{"decision": "BUY", "entry": "Rs. 1420 - 1435", "target": "Rs. 1580", '
                f'"stop_loss": "Rs. 1375", "confidence": 87.5, '
                f'"reasoning": "Detailed 3-4 sentence professional analysis here. Risk capital only."}}'
            ),
            agent=agent,
            expected_output=(
                f'A single valid JSON object with keys: decision, entry, target, stop_loss, confidence, reasoning. '
                f'No markdown, no extra text. Only the JSON.'
            )
        )
