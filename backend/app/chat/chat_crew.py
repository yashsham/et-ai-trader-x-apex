from crewai import Crew, Process, Task
from app.agents.trading_agents import TradingAgents
from app.chat.tools import financial_data_tool, news_data_tool
from app.core.response_normalizer import response_normalizer
import json

class ChatbotCrew:
    def __init__(self, query: str, context: dict = {}, language: str = "English"):
        self.query = query
        self.context = context
        self.agents = TradingAgents(language=language)

    def run(self):
        # 1. Specialized Agents
        router = self.agents.query_router_agent()
        researcher = self.agents.data_agent()
        analyst = self.agents.signal_agent()
        sentiment_bot = self.agents.sentiment_agent()
        compliance_guard = self.agents.compliance_agent()
        decision_agent = self.agents.decision_agent() # The Final Decision Agent

        # 2. Sequential Task Flow
        
        # Task 1: Identify Query Intent
        route_task = Task(
            description=(
                f"Analyze the user query: '{self.query}'. "
                "Classify it as 'STOCK_RESEARCH', 'MARKET_NEWS', 'TRADING_CONCEPT', or 'PORTFOLIO_ADVICE'."
            ),
            expected_output="A single category label and a list of identified ticker symbols.",
            agent=router
        )

        # Task 2: Market Data Extraction
        market_task = Task(
            description="Fetch live prices, volume, and technical context for the identified symbols.",
            expected_output="Detailed fact sheet of live market numbers.",
            agent=researcher,
            tools=[financial_data_tool]
        )

        # Task 3: News & Catalyst Analysis
        news_task = Task(
            description="Search for the latest market-moving news and sentiment for the identified symbols.",
            expected_output="Sentiment summary and key news catalysts.",
            agent=sentiment_bot,
            tools=[news_data_tool]
        )

        # Task 4: Compliance Scan
        compliance_task = Task(
            description=(
                "Review the gathered market and news data. Ensure no definitive 'Buy/Sell' promises are made "
                "without mentioning risk."
            ),
            expected_output="A safety-approved context block with risk disclosures.",
            agent=compliance_guard
        )

        # Task 5: Final Executive Synthesis
        decision_task = Task(
            description=(
                "Review the entire data chain. Compose a final, premium response to the user's query: '{self.query}'. "
                "MANDATORY FORMATTING: \n"
                "### 💎 **CORE MARKET INSIGHT**\n"
                "[Insight text here]\n\n"
                "### 📈 **TECHNICAL & SENTIMENT PULSE**\n"
                "[Analysis here with bullet points]\n\n"
                "### 🛡️ **RISK GUARD & NEXT STEPS**\n"
                "[Specific warnings and actions]\n\n"
                "**BOTTOM LINE:** [Final sharp conclusion]\n"
                "Maintain a clean, sophisticated look with consistent spacing."
            ),
            expected_output=f"A visually stunning, bolded markdown report in {self.agents.language}.",
            agent=decision_agent
        )

        # 3. Kickoff
        crew = Crew(
            agents=[router, researcher, sentiment_bot, compliance_guard, decision_agent],
            tasks=[route_task, market_task, news_task, compliance_task, decision_task],
            process=Process.sequential,
            verbose=True
        )

        result = crew.kickoff()
        raw_result = str(result)
        print(f"[ChatbotCrew] Final Result: {raw_result[:100]}...")
        return {
            "explanation": raw_result,
            "symbols": [] # Symbols can be extracted later if needed
        }
