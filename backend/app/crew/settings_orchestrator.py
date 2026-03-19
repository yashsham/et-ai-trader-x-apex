from crewai import Crew, Process, Task
from app.agents.trading_agents import TradingAgents
import json

class SettingsCrew:
    def __init__(self, requested_changes: dict):
        self.requested_changes = requested_changes
        self.agents = TradingAgents()

    def run(self):
        # 1. Specialized Agents
        security = self.agents.settings_security_agent()
        prefence_expert = self.agents.preference_agent()
        decider = self.agents.decision_agent()

        # 2. Sequential Task Flow
        
        # Task 1: Security Validation
        validation_task = Task(
            description=(
                f"Review these requested settings changes: {json.dumps(self.requested_changes)}. "
                "Ensure no malicious scripts or injection attempts are hidden in text fields. "
                "Validate that numeric ranges (like risk score) are within bounds."
            ),
            expected_output="A 'Sanitized' version of the settings or a security rejection message.",
            agent=security
        )

        # Task 2: Preference Resolution
        resolution_task = Task(
            description=(
                "Check for logical consistency in the sanitized settings. "
                "For example, if 'Silent Mode' is on, 'Push Notifications' should be disabled. "
                "Ensure the 'theme_mode' matches common accessible standards."
            ),
            expected_output="A logically consistent set of user preferences.",
            agent=prefence_expert
        )

        # Task 3: Final Consolidation
        final_task = Task(
            description=(
                "Produce the final JSON configuration that will be stored in the database. "
                "Add a internal 'last_validated' timestamp."
            ),
            expected_output="A clean, structured JSON object of user settings.",
            agent=decider
        )

        # 3. Kickoff
        crew = Crew(
            agents=[security, prefence_expert, decider],
            tasks=[validation_task, resolution_task, final_task],
            process=Process.sequential,
            verbose=True
        )

        result = crew.kickoff()
        return str(result)
