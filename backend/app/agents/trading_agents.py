from crewai import Agent
from langchain_openai import ChatOpenAI
import os

class TradingAgents:
    def __init__(self):
        self.llm = ChatOpenAI(model=os.getenv("MODEL", "gpt-4-turbo"))

    def data_agent(self):
        return Agent(
            role="Market Data Collector",
            goal="Fetch accurate stock and news data for analysis",
            backstory="Expert in financial data aggregation with 15 years in quant research.",
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )

    def signal_agent(self):
        return Agent(
            role="Technical Analyst AI",
            goal="Identify high-probability trading signals and patterns",
            backstory="A wizard of candlestick patterns and Fibonacci levels.",
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )

    def sentiment_agent(self):
        return Agent(
            role="Market Sentiment Analyst",
            goal="Evaluate news impact and market mood on specific stocks",
            backstory="Specializes in NLP and behaviorial finance.",
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )

    def portfolio_agent(self):
        return Agent(
            role="Portfolio Risk Strategist",
            goal="Check diversification and risk exposure for the user's portfolio",
            backstory="Former hedge fund risk manager who prioritizes capital preservation.",
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )

    def decision_agent(self):
        return Agent(
            role="AI Trading Strategist",
            goal="Generate final BUY/SELL decisions with clear Hinglish reasoning",
            backstory="The ultimate decision maker who weighs all evidence before taking action.",
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )
