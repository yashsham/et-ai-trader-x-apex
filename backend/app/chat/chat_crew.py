from crewai import Crew, Process, Task
from app.agents.trading_agents import TradingAgents
from app.chat.tools import financial_data_tool, news_data_tool, rag_tool
from app.core.response_normalizer import response_normalizer
import json

class ChatbotCrew:
    def __init__(self, query: str, context: dict = {}):
        self.query = query
        self.context = context
        self.agents = TradingAgents()

    def run(self):
        # 1. Specialized Agents
        router = self.agents.query_router_agent()
        researcher = self.agents.data_agent() # Reusing existing data agent
        catalyst_hacker = self.agents.catalyst_agent() # For news/sentiment
        retriever = self.agents.explanation_agent() # Using educator for RAG synthesis
        compliance_guard = self.agents.compliance_agent()
        answer_expert = self.agents.answer_agent()

        # 2. Sequential Task Flow
        
        # Task 1: Query Routing
        route_task = Task(
            description=(
                f"Analyze the user query: '{self.query}'. "
                "Classify it as 'STOCK_RESEARCH', 'MARKET_NEWS', 'TRADING_CONCEPT', or 'PORTFOLIO_ADVICE'."
            ),
            expected_output="A single category label and a list of identified ticker symbols.",
            agent=router
        )

        # Task 2: Data Gathering (Conditional in logic, but sequential in Crew)
        research_task = Task(
            description=(
                "If the query involves stocks, fetch live metrics and prices. "
                "If it involves news, gather recent headlines and sentiment."
            ),
            expected_output="A consolidated fact sheet of live market numbers and news.",
            agent=researcher,
            tools=[financial_data_tool, news_data_tool]
        )

        # Task 3: RAG Retrieval
        rag_task = Task(
            description=(
                f"Search the internal knowledge base for any principles or past context related to: '{self.query}'. "
                "Look for 'ET AI Trader' specific strategies or general market wisdom."
            ),
            expected_output="Relevant snippets and principles from the RAG knowledge base.",
            agent=retriever,
            tools=[rag_tool]
        )

        # Task 4: Compliance Review
        compliance_task = Task(
            description=(
                "Review the gathered data and RAG context. Ensure no definitive 'Buy/Sell' promises are made "
                "without mentioning risk. Filter out any potential hallucinations."
            ),
            expected_output="A 'Safety Approved' version of the context with mandatory risk disclosures.",
            agent=compliance_guard
        )

        # Task 5: Final Answer Formulation
        answer_task = Task(
            description=(
                "Synthesize everything into a helpful, empathetic, and professional response. "
                "Use the 'Professional Financial Communicator' persona. If symbols are mentioned, "
                "provide a clear consensus summary."
            ),
            expected_output="A beautifully formatted markdown response with citations.",
            agent=answer_expert
        )

        # 3. Kickoff
        crew = Crew(
            agents=[router, researcher, retriever, compliance_guard, answer_expert],
            tasks=[route_task, research_task, rag_task, compliance_task, answer_task],
            process=Process.sequential,
            verbose=True
        )

        result = crew.kickoff()
        raw_result = str(result)
        
        # Normalize/Normalize for API
        normalized = response_normalizer.normalize(raw_result, source="AICopilot")
        return normalized.model_dump()
