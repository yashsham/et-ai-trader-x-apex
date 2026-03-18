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
            description=f"Synthesize all data to give a final BUY/SELL/HOLD decision for {symbol} with Entry, Target, and Stop Loss parameters. Explain the rationale in Hinglish.",
            agent=agent,
            expected_output='''Strictly return a valid JSON object matching this exact schema:
{
  "decision": "BUY",
  "entry": "Rs. 2450 - 2460",
  "target": "Rs. 2650",
  "stop_loss": "Rs. 2380",
  "confidence": 92.5,
  "reasoning": "Provide detailed Hinglish explanation here..."
}
Do not include any additional text or markdown formatting outside of the JSON block.'''
        )
