from crewai import Crew, Process, Task
from app.agents.trading_agents import TradingAgents
import json

class NewsCrew:
    def __init__(self, news_items: list):
        self.news_items = news_items
        self.agents = TradingAgents()

    def run(self):
        # 1. Specialized Agents
        clusterer = self.agents.cluster_agent()
        impact_analyst = self.agents.impact_agent()
        sector_expert = self.agents.sector_agent()
        editor = self.agents.answer_agent()

        # 2. Sequential Task Flow
        
        # Task 1: Clustering & Deduplication
        cluster_task = Task(
            description=(
                f"Analyze these news items: {json.dumps(self.news_items[:15])}. "
                "Group similar headlines into 'Story Arcs'. Filter out duplicates or noise. "
                "Ensure only unique narratives remain."
            ),
            expected_output="A list of unique story objects, each containing a primary headline and a list of related source links.",
            agent=clusterer
        )

        # Task 2: Impact & Sentiment Analysis
        impact_task = Task(
            description=(
                "For each unique story, determine its market impact (High/Medium/Low) and general sentiment. "
                "Focus on urgency for an Indian retail investor."
            ),
            expected_output="Impact scores and sentiment labels for each story arc.",
            agent=impact_analyst
        )

        # Task 3: Sector & Stock Mapping
        mapping_task = Task(
            description=(
                "Map each story to its most relevant industry sector (e.g., IT, Banking, Auto) "
                "and identify any specific stock tickers mentioned or affected."
            ),
            expected_output="A mapping of stories to sectors and symbol tags.",
            agent=sector_expert
        )

        # Task 4: Content Curation (Why it Matters)
        curation_task = Task(
            description=(
                "Write a 1-sentence 'Why it matters' for each story in professional Hinglish. "
                "Summarize the core investor takeaway."
            ),
            expected_output="A JSON-like structure of refined news stories with summaries and investor context.",
            agent=editor
        )

        # 3. Kickoff
        crew = Crew(
            agents=[clusterer, impact_analyst, sector_expert, editor],
            tasks=[cluster_task, impact_task, mapping_task, curation_task],
            process=Process.sequential,
            verbose=True
        )

        result = crew.kickoff()
        return str(result)
