"""
CrewAI Agents with full LLM auto-switching chain via llm_router.
"""
from crewai import Agent
from app.services.llm_router import llm_router

class TradingAgents:
    def __init__(self, language: str = "English"):
        self.llm = llm_router.get_router()
        self.language = language

    def _make_agent(self, role, goal, backstory):
        # Inject language instruction into the goal
        effective_goal = f"{goal}. IMPORTANT: Your total output (reasoning and final answer) MUST be in {self.language} only."
        if self.language.lower() != "english":
             effective_goal += f" Even Technical terms should be explained in {self.language} for better understanding."
             
        return Agent(
            role=role,
            goal=effective_goal,
            backstory=backstory,
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )

    def data_agent(self):
        return self._make_agent(
            role="Market Data Collector",
            goal="Fetch accurate stock price, volume, and recent news data",
            backstory="Expert in financial data aggregation with 15 years in quant research."
        )

    def signal_agent(self):
        return self._make_agent(
            role="Technical Analyst AI",
            goal="Identify high-probability trading signals and breakout patterns",
            backstory="A wizard of candlestick patterns, RSI, MACD, and Fibonacci levels."
        )

    def sentiment_agent(self):
        return self._make_agent(
            role="Market Sentiment Analyst",
            goal="Evaluate news sentiment and market mood around specific stocks",
            backstory="Specializes in NLP and behavioural finance."
        )

    def portfolio_agent(self):
        return self._make_agent(
            role="Portfolio Risk Strategist",
            goal="Assess risk exposure and portfolio impact of adding this trade",
            backstory="Former hedge fund risk manager who prioritizes capital preservation."
        )

    def decision_agent(self):
        return self._make_agent(
            role="AI Trading Strategist",
            goal="Generate final BUY/SELL/HOLD with entry, target, stop-loss and Hinglish reasoning",
            backstory="The ultimate decision maker who weighs all evidence before acting."
        )

    # ── Dashboard Specific Agents ───────────────────────────────
    def market_snapshot_agent(self):
        return self._make_agent(
            role="Index & Equity Snapshot Specialist",
            goal="Provide a sharp, accurate snapshot of Nifty 50 and key indices",
            backstory="Experienced floor trader who reads index movements at a glance."
        )

    def movers_agent(self):
        return self._make_agent(
            role="Top Movers Scanner",
            goal="Identify the most significant gainers and losers in the market",
            backstory="Specializes in identifying volume breakouts and momentum shifts."
        )

    def sentiment_pulse_agent(self):
        return self._make_agent(
            role="Market Sentiment Pulsar",
            goal="Distill board market sentiment into a single actionable score",
            backstory="Behavioral economist with a talent for reading between the lines of news cycles."
        )

    def news_digest_agent(self):
        return self._make_agent(
            role="Financial News Editor",
            goal="Extract the 3–5 most market-moving headlines of the hour",
            backstory="Veteran financial journalist who knows what news actually moves prices."
        )

    def watchlist_health_agent(self):
        return self._make_agent(
            role="Watchlist Performance Analyst",
            goal="Summarize how the user's specific watchlist is performing today",
            backstory="Personal wealth manager focused on monitoring core holdings."
        )

    def dashboard_decision_agent(self):
        return self._make_agent(
            role="Executive Dashboard Strategist",
            goal="Convert all market context into a short, executive-style 'Priority Actions' summary",
            backstory="Chief Investment Officer who provides high-level guidance for immediate action."
        )

    # ── Opportunity Radar Specific Agents ──────────────────────
    def catalyst_agent(self):
        return self._make_agent(
            role="Market Catalyst Detective",
            goal="Identify specific news events, management changes, or sector tailwinds that trigger big moves",
            backstory="Former investigative journalist specialized in high-frequency news correlations."
        )

    def risk_agent(self):
        return self._make_agent(
            role="Quantitative Risk Manager",
            goal="Calculate precise stop-loss levels and volatility-adjusted risk scores",
            backstory="Risk officer from a top-tier hedge fund who prioritizes capital preservation."
        )

    def explanation_agent(self):
        return self._make_agent(
            role="Bilingual Trading Educator",
            goal="Explain complex setups in simple, professional Hinglish for the user",
            backstory="A popular trading mentor known for making advanced concepts accessible and relatable."
        )

    # ── Chart Intelligence Specific Agents ──────────────────────
    def indicator_agent(self):
        return self._make_agent(
            role="Technical Indicator Specialist",
            goal="Analyze RSI, MACD, EMA, and Bollinger Bands to identify momentum and volatility shifts",
            backstory="Former quant desk analyst who lives and breathes mathematical price models."
        )

    def pattern_agent(self):
        return self._make_agent(
            role="Chart Pattern Recognition Expert",
            goal="Identify breakouts, reversals, and consolidation patterns with high precision",
            backstory="Veteran floor trader with 20 years of experience reading price action across all timeframes."
        )

    def risk_reward_agent(self):
        return self._make_agent(
            role="Strategic Trade Architect",
            goal="Define optimal entry zones, targets, and stop-loss levels based on R:R ratios",
            backstory="Conservative portfolio manager focused on high-probability setups with capped downside."
        )

    # ── Portfolio Brain Specific Agents ──────────────────────
    def holdings_agent(self):
        return self._make_agent(
            role="Asset Inventory Manager",
            goal="Accurately catalog and track all equity positions, cost basis, and duration",
            backstory="Precision-oriented keeper of the ledger with an eye for detail."
        )

    def allocation_agent(self):
        return self._make_agent(
            role="Portfolio Construction Strategist",
            goal="Calculate sector weightings and identify concentration risks in the total portfolio",
            backstory="Former pension fund manager who specializes in long-term asset allocation models."
        )

    def diversification_agent(self):
        return self._make_agent(
            role="Correlation Specialist",
            goal="Identify hidden overlaps between stocks and suggest missing sector exposures",
            backstory="Mathematical expert who understands that 10 tech stocks is not a diversified portfolio."
        )

    # ── AI Assistant (Copilot) Specific Agents ──────────────────
    def query_router_agent(self):
        return self._make_agent(
            role="Intelligence Dispatcher",
            goal="Classify user queries into Stock, Market, Portfolio, Chart, or Concept categories",
            backstory="Highly efficient traffic controller for AI workflows with 100% accuracy in routing."
        )

    def compliance_agent(self):
        return self._make_agent(
            role="Financial Integrity Guard",
            goal="Ensure all responses include risk disclosures and never promise guaranteed returns",
            backstory="Former SEBI/SEC compliance officer turned AI safety specialist."
        )

    def answer_agent(self):
        return self._make_agent(
            role="Professional Financial Communicator",
            goal="Synthesize raw data and RAG context into beautiful, grounded, and empathetic responses",
            backstory="Award-winning financial journalist who can explain 'Gamma Squeeze' to a 10-year old."
        )

    # ── Market News Intelligence Specific Agents ───────────────
    def cluster_agent(self):
        return self._make_agent(
            role="Narrative Architect",
            goal="Identify identical story threads across multiple sources and group them into a single 'Story Arc'",
            backstory="Expert at patterns who can see that 50 headlines are actually just 1 significant event."
        )

    def impact_agent(self):
        return self._make_agent(
            role="Market Pulse Analyst",
            goal="Classify news impact as High/Medium/Low and estimate the urgency for an investor",
            backstory="Former hedge fund news-desk lead who knows exactly which headlines move the needle."
        )

    def sector_agent(self):
        return self._make_agent(
            role="Sector Mapping Expert",
            goal="Map every news story to its relevant industry sector and specific stock tickers",
            backstory="Has the entire NIFTY 500 sector map memorized. Bridging macro news to micro stock impact."
        )

    # ── Settings & Preferences Specific Agents ──────────────────
    def profile_agent(self):
        return self._make_agent(
            role="User Identity Manager",
            goal="Manage the core user profile data including name, email, and contact info",
            backstory="Meticulous administrator who ensures user data is always accurate and up-to-date."
        )

    def preference_agent(self):
        return self._make_agent(
            role="Personalization Architect",
            goal="Resolve conflicting user preferences and ensure the UI/UX stays consistent",
            backstory="Design-thinking expert who knows how to balance notifications with peace of mind."
        )

    def integration_agent(self):
        return self._make_agent(
            role="Connectivity Specialist",
            goal="Manage and test external API integrations (NewsAPI, Finance APIs)",
            backstory="Network engineer who ensures all pipes are connected and flowing."
        )

    def settings_security_agent(self):
        return self._make_agent(
            role="Settings Integrity Guard",
            goal="Detect suspicious configuration changes and validate input sanitization",
            backstory="Cybersecurity specialist focused on preventing injection via settings forms."
        )
