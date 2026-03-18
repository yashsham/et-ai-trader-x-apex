from crewai import Agent, Task, Crew, Process
from app.chat.tools import financial_data_tool, news_data_tool, rag_tool
from app.agents.trading_agents import _get_llm

class ChatbotCrew:
    def __init__(self, query: str):
        self.query = query
        self.llm = _get_llm()

    def run(self) -> str:
        # Define Agents
        researcher = Agent(
            role="Financial Market Researcher",
            goal="Extract mentions of stock symbols from the user query and gather live financial data, news, and RAG context.",
            backstory="An expert financial analyst with access to real-time market data and historical trading knowledge.",
            verbose=True,
            allow_delegation=False,
            tools=[financial_data_tool, news_data_tool, rag_tool],
            llm=self.llm
        )

        advisor = Agent(
            role="AI Trading Assistant",
            goal="Provide a concise, highly accurate, and engaging response to the user query based on the researcher's findings.",
            backstory="A seasoned trading advisor who communicates clearly, incorporating risk management and market trends.",
            verbose=True,
            allow_delegation=False,
            llm=self.llm
        )

        # Define Tasks
        research_task = Task(
            description=(
                f"Analyze this query: '{self.query}'. "
                "If it mentions a stock, fetch its live data using 'Financial Data Tool' and news using 'News Data Tool'. "
                "If the query is about general trading principles or strategies, query the RAG knowledge base using 'Trading Knowledge RAG Tool'."
            ),
            expected_output="A summary of facts, numbers, and news or principles relevant to the user's query.",
            agent=researcher
        )

        respond_task = Task(
            description=(
                "Take the researcher's summary and formulate a direct answer to the user's original query. "
                "Format the response beautifully with markdown if needed. Be concise, actionable, and professional."
            ),
            expected_output="A helpful, professional response to the user.",
            agent=advisor
        )

        # Assemble Crew
        crew = Crew(
            agents=[researcher, advisor],
            tasks=[research_task, respond_task],
            process=Process.sequential,
            verbose=True
        )

        try:
            result = crew.kickoff()
            return str(result)
        except Exception as e:
            print("CrewAI execution failed:", e)
            return f"I encountered an error while processing your request: {str(e)}"
