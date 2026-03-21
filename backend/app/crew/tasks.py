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
        from app.chat.validators import TradingAnalysisSchema
        return Task(
            description=(
                f"Synthesize all research data to give a final BUY/SELL/HOLD decision for {symbol}. "
                "You MUST provide specific Entry, Target, and Stop Loss levels. "
                "Ensure your reasoning reflects deep institutional-grade expertise."
            ),
            agent=agent,
            expected_output=f"A complete, structured trading plan for {symbol} including Entry, Target, and Stop Loss.",
            output_pydantic=TradingAnalysisSchema
        )
