# 📈 ET AI Trader X-Apex

**ET AI Trader X-Apex** is an institutional-grade, high-performance trading intelligence platform powered by a resilient, multi-agent AI swarm. Designed for high-conviction decision making, it delivers real-time technical analysis, pattern recognition, and strategic blueprints.

---

## 🏆 Core Intelligence Pillars

### 1. **Opportunity Radar (Signal Finder)**
Identifies high-conviction breakout/breakdown signals using real-time sentiment and institutional volume tracking. 

### 2. **Live Chart Pattern Intelligence**
- **4s Performance**: Optimized async swarms deliver pattern analysis in under 5 seconds.
- **Backtested Accuracy**: Quantifies risk by providing historical success rates for detected formations (e.g., Bullish Flags, Head & Shoulders).

### 3. **Next-Gen AI Assistant (Market ChatGPT)**
- **Agentic Reasoning**: Watch the specialist agents (Data, Sentiment, Decision) collaborate in real-time.
- **Source Transparency**: Every insight is grounded in verifiable data (NSE Filings, ET Markets, etc.).

---

## 🛡️ **Advanced Resilience & Performance**

### ⚡ **Async SWIFT Swarm**
The platform uses a streamlined, non-blocking multi-agent architecture. Sequential LLM chains have been optimized into specialized "Duos" and "Trios" to ensure UI responsiveness.

### 🔍 **5s Data Watchdog**
Built-in resilience layer for `yfinance` and external APIs. If an upstream provider hangs, the system automatically injects a high-fidelity synthetic data bridge to prevent service stalls.

### 🏗️ **Indestructible AI Parser**
A 3-tier parsing engine (JSON → Regex → Heuristic) ensures that AI insights are successfully extracted and displayed, regardless of LLM prose variability.

---

## 🚀 Quick Start (Windows Optimized)

### 1. Prerequisites
- **Node.js**: v20+
- **Python**: v3.10+
- **Supabase Account**: Required for Auth/DB.

### 2. Environment Configuration
Create a `.env` file in the `backend/` directory:
```env
GROQ_API_KEY=your_groq_api_key
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_service_role_key
```

### 3. Backend Execution
From the `backend/` directory:
```powershell
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
# Run via module mode for correct path resolution
python -m app.main
```

### 4. Frontend Execution
From the root directory:
```powershell
npm install
# Force 127.0.0.1 for maximum Windows compatibility
npm run dev -- --host 127.0.0.1
```

---

## 📂 Project Architecture
```text
et-ai-trader-x-apex/
├── backend/            # FastAPI Institutional Core
│   ├── app/            # Main application logic
│   │   ├── services/   # AI, Market & Cache Services
│   │   ├── crew/       # Async Agent Swarm Orchestration
│   │   └── api/        # Endpoint Routing
├── src/                # React Performance UI
│   ├── pages/          # ChartIntelligence, AlphaDecision, Portfolio
│   ├── components/     # High-fidelity dashboard modules
│   └── lib/            # API & Auth Configuration
└── tests/              # E2E & Unit Tests
```

---

## 📄 Operational Status
- **Interface**: `127.0.0.1:5173` (Frontend) | `127.0.0.1:8000` (Backend)
- **Status**: **All Systems Nominal**

*Built for the next generation of Alpha seekers.*
This project is private and intended for administrative use by **ET AI Trader**.

---

## 🛠️ **Deployment to Render**

To deploy the **ET AI Trader Backend** to Render, use the following configuration for a **Web Service**:

- **Runtime**: `Python`
- **Root Directory**: `backend` (Important for monorepo resolution)
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 🔑 Environment Variables on Render
Ensure the following variables are set in the Render Dashboard:
- `GROQ_API_KEY`: Your Groq API key.
- `SUPABASE_URL`: Your Supabase Project URL.
- `SUPABASE_KEY`: Your Supabase Service Role Key.
- `PORT`: 10000 (Render provides this automatically).

---

*Built with ❤️ by the ET AI Trader Team.*
