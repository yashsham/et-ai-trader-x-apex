# 📈 ET AI Trader X-Apex

**ET AI Trader X-Apex** is an institutional-grade, high-performance trading intelligence platform. Powered by a specialized **Multi-Agent AI Swarm (SWIFT Swarm)**, it transforms raw market data into high-conviction strategic blueprints in under 4 seconds.

Designed for the modern quantitative trader, X-Apex bridges the gap between complex algorithmic analysis and intuitive decision-making.

---

## 💎 Core Intelligence Matrix

### 1. 📡 **Opportunity Radar (Signal Catalyst)**
The primary alert engine that scans the market for high-probability setups.
- **Dynamic Heatmapping**: Visualizes institutional volume surges and volatility clusters.
- **Sentiment Scouring**: Real-time analysis of global news and social sentiment (NSE, ET Markets, Globenewswire).
- **Signal Logic**: Generates multi-factor "Conviction Scores" (Bullish/Bearish/Neutral).

### 2. 📊 **Live Chart Intelligence (Pattern Alpha)**
An advanced computer-vision-inspired pattern recognition engine.
- **Symmetry Detection**: Identifies Bull Flags, Head & Shoulders, and Fibonacci levels with pixel-perfect precision.
- **Visual Evidence**: Provides annotated snapshots and geometric breakdowns of every detected setup.
- **Risk Quantization**: Automatically calculates stop-loss and take-profit targets based on historical pattern success rates.

### 3. 🤖 **Alpha Decision Engine (The Swarm Assistant)**
A collaborative agentic environment where specialized AI personas work together.
- **Data Specialist**: Fetches and cleans real-time technical indicators.
- **Sentiment Specialist**: Evaluates the human factor and news impact.
- **Risk Specialist**: Synthesizes the final "Alpha Blueprint" with a focus on capital preservation.
- **Transparent Reasoning**: Watch the "thought process" as agents debate the trade's validity.

### 4. 🧠 **Portfolio Brain (Strategic Custodian)**
Your AI-powered portfolio management and risk dashboard.
- **Alpha Leakage Detection**: Identifies underperforming assets and suggests rebalancing strategies.
- **Scenario Simulation**: Predicts how your portfolio will react to market-wide volatility spikes (Beta analysis).
- **Wealth Guard**: Real-time monitoring of total equity and P&L tracking.

---

## 🏗️ The "X-Apex" Architecture

### ⚡ **SWIFT Multi-Agent Swarm**
Traditional AI wrappers are sequential and slow. X-Apex uses a **Non-Blocking Async Swarm**. By orchestrating specialized agents in parallel (Duos and Trios), the platform delivers comprehensive analysis in **<4.5 seconds**, maintaining UI fluidity.

### 🔍 **5s Data Watchdog (Resilience Layer)**
A proprietary monitoring layer built for Windows/Render stability. If a data provider (yfinance, News APIs) hangs or rate-limits, the **Watchdog** automatically injects high-fidelity synthetic data or fails over to secondary sources to prevent application lockup.

### 🛡️ **Indestructible AI Parser**
LLMs can be unpredictable. Our 3-tier parsing engine (**JSON → Structured Regex → Semantic Heuristic**) ensuring that regardless of how the AI "speaks," the critical trading data is extracted and rendered perfectly every time.

### 🚦 **Failover LLM Routing**
The system intelligently routes requests based on complexity and availability. If your primary LLM (Groq) hits a token limit, the **LLM Router** seamlessly switches to fallback providers without interrupting the user session.

---

## 🛠️ Zero-to-Advanced Local Setup (Windows Optimized)

### 1. Core Prerequisites
- **Node.js**: v20.x or higher (LTS recommended)
- **Python**: v3.12.x+ (Ensure "Add to PATH" is checked during installation)
- **Git**: For version control and dependency management.

### 2. Dependency Installation

**Frontend (React + Vite + Tailwind):**
```powershell
# From the project root
npm install
```

**Backend (FastAPI + CrewAI + LangChain):**
```powershell
# From the /backend directory
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Environment Configuration
Create a `.env` file in the `backend/` directory (use `.env.example` as a template if available):
```env
# AI Intelligence (Groq is recommended for SWIFT performance)
GROQ_API_KEY=your_groq_key_here

# Persistence & Auth (Supabase)
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key

# Optional: External News/Social APIs
NEWS_API_KEY=your_news_key (Optional)
```

### 4. Execution Workflow

To start the platform for local development, run these two processes in separate terminals:

**Terminal A: The Backend Engine**
```powershell
cd backend
.\venv\Scripts\activate
# Run as a module to handle cross-directory imports
python -m app.main
```

**Terminal B: The Intelligence UI**
```powershell
# From the project root
# Using 127.0.0.1 forces Windows to bypass slow DNS resolution
npm run dev -- --host 127.0.0.1
```

---

## 🚦 Operational Dashboard
- **Frontend URL**: `http://127.0.0.1:5173`
- **Backend API**: `http://127.0.0.1:8000/docs` (OpenAPI documentation)
- **Database Status**: Integrated via Supabase Real-time.
- **Agent Status**: **All Swarms Active**

---

## 👨‍⚖️ For The Judges: Why X-Apex?

X-Apex isn't just a dashboard; it's a **resilient infrastructure**. We solved the core problems of agentic AI:
1. **Latency**: Sub-5s response times through async orchestration.
2. **Reliability**: Indestructible parsing and data watchdogs.
3. **UX**: A frame-motion optimized dashboard that feels like a native desktop app.
4. **Resilience**: Smart failover routing for cost and uptime optimization.

---
*Built with passion by the ET AI Trader Team. Focused on Local Excellence.*
