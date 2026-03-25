from crewai import Crew, Process, Task
from app.agents.trading_agents import TradingAgents
from app.chat.tools import financial_data_tool, news_data_tool
from app.chat.validators import TradingAnalysisSchema
from app.core.response_normalizer import response_normalizer
import json

class ChatbotCrew:
    def __init__(self, query: str, context: dict = {}, language: str = "English", symbols: list = []):
        self.query = query
        self.context = context
        self.language = language
        self.symbols = symbols
        self.agents = TradingAgents(language=language)

    def run(self):
        # 1. Specialized Agents
        manager = self.agents.manager_agent()
        router = self.agents.query_router_agent()
        researcher = self.agents.data_agent()
        sentiment_bot = self.agents.sentiment_agent()
        compliance_guard = self.agents.compliance_agent()
        decision_agent = self.agents.decision_agent() 

        # 2. Dynamic Task Flow
        tasks = []
        
        # symbols_str for tasks
        symbols_to_work_on = ", ".join(self.symbols) if self.symbols else "the identified symbols"

        # Task 1: Identify Query Intent (Only if not provided)
        if not self.symbols:
            route_task = Task(
                description=(
                    f"Analyze the user query: '{self.query}'. "
                    "Classify it as 'STOCK_RESEARCH', 'MARKET_NEWS', 'TRADING_CONCEPT', or 'PORTFOLIO_ADVICE'."
                ),
                expected_output="A single category label and a list of identified ticker symbols.",
                agent=router
            )
            tasks.append(route_task)

        # Task 2: Market Data Extraction (ASYNCHRONOUS)
        market_task = Task(
            description=f"Fetch live prices, volume, and technical context for {symbols_to_work_on}.",
            expected_output="Detailed fact sheet of live market numbers.",
            agent=researcher,
            tools=[financial_data_tool],
            async_execution=True # Run in parallel with news
        )
        tasks.append(market_task)

        # Task 3: News & Catalyst Analysis (ASYNCHRONOUS)
        news_task = Task(
            description=f"Search for the latest market-moving news and sentiment for {symbols_to_work_on}.",
            expected_output="Sentiment summary and key news catalysts.",
            agent=sentiment_bot,
            tools=[news_data_tool],
            async_execution=True # Run in parallel with market data
        )
        tasks.append(news_task)

        # Task 4: Compliance Scan
        compliance_task = Task(
            description=(
                "Review the gathered market and news data. Ensure no definitive 'Buy/Sell' promises are made "
                "without mentioning risk."
            ),
            expected_output="A safety-approved context block with risk disclosures.",
            agent=compliance_guard,
            context=[market_task, news_task] # Depends on parallel results
        )
        tasks.append(compliance_task)

        # Task 5: Final Executive Synthesis
        decision_task = Task(
            description=(
                f"Review the entire data chain. Compose a final, premium response to the user's query: '{self.query}'. "
                "Ensure your reasoning is deep and reflects a 40-year veteran perspective. "
                "CRITICAL: You MUST explicitly cite your data sources for any news, filings, bulk deals, or market data mentioned (e.g., 'Source: NSE filing', 'per ET Markets data'). "
                "Structure your output according to the provided Pydantic schema."
            ),
            expected_output=f"A high-conviction, professional trading analysis in {self.language}.",
            agent=decision_agent,
            context=[compliance_task],
            output_pydantic=TradingAnalysisSchema # Production-grade validation
        )
        tasks.append(decision_task)

        # 3. Kickoff
        crew = Crew(
            agents=[router, researcher, sentiment_bot, compliance_guard, decision_agent],
            tasks=tasks,
            process=Process.hierarchical,
            manager_agent=manager,
            memory=True,
            cache=True,
            verbose=True
        )

        result = crew.kickoff()
        
        # result is now a Pydantic object if we use output_pydantic
        # We convert it back to a beautiful markdown string for the UI
        try:
            if hasattr(result, 'pydantic') and result.pydantic:
                p = result.pydantic
                # New universal schema: always has decision/reasoning
                decision_badge = f"**{p.decision}**" if p.decision else "**HOLD**"
                
                # Build sections from whichever fields are available
                sections = [f"### 🏗️ **THE BLUEPRINT**\n"]
                
                if p.reasoning:
                    sections.append(f"{p.reasoning}\n\n")
                elif p.core_insight:
                    sections.append(f"{p.core_insight}\n\n")
                
                if p.technical_bullets:
                    sections.append("### ⚙️ **EXECUTION ENGINE**\n" + 
                        "\n".join([f"- {b}" for b in p.technical_bullets]) + "\n\n")
                
                # Add key levels
                if p.entry or p.target or p.stop_loss:
                    levels = []
                    if p.entry: levels.append(f"**Entry:** {p.entry}")
                    if p.target: levels.append(f"**Target:** {p.target}")
                    if p.stop_loss: levels.append(f"**Stop Loss:** {p.stop_loss}")
                    sections.append("#### 📊 **KEY LEVELS**\n" + "  |  ".join(levels) + "\n\n")
                
                if p.risk_notes:
                    sections.append(f"### 🛡️ **RISK MITIGATION**\n{p.risk_notes}\n\n")
                
                if p.bottom_line:
                    sections.append(f"**BOTTOM LINE:** {p.bottom_line}")
                    
                raw_result = "\n\n".join(sections)
            else:
                raw_result = str(result)
        except Exception as e:
            print(f"[ChatbotCrew] Pydantic parsing error: {e}")
            raw_result = str(result)

        print(f"[ChatbotCrew] Final Result: {raw_result[:100]}...")
        return {
            "explanation": raw_result,
            "symbols": self.symbols 
        }
