# 📈 ET AI Trader X-Apex

**ET AI Trader X-Apex** is an advanced, high-performance, real-time trading and portfolio management platform powered by an intelligent AI agent swarm. Designed for modern traders, it provides deep market insights, automated portfolio analysis, and an agentic trading assistant.

---

## 🌟 Key Features

### 📡 Real-time Market Intelligence
*   **Live Market Status**: Real-time tracking of Indian Stock Market (NSE/BSE) hours (9:15 AM - 3:30 PM IST).
*   **Intelligent Search**: Fast, debounced stock search connected to backend symbol intelligence.
*   **Live Notifications**: Instant alerts for price targets, market sentiment shifts, and AI scan completions.

### 🧠 Portfolio Brain (AI Swarm)
*   **Automated Risk Analysis**: Leverages a Multi-Agent AI Swarm (CrewAI) to analyze holdings for risk, diversification, and growth potential.
*   **Sector Exposure**: Visual breakdown of portfolio allocation across market sectors.
*   **Personalized Insights**: Real-time, AI-generated suggestions based on current market conditions and user-specific risk profiles.

### 🤖 AI Trading Assistant
*   **Agentic Thinking**: Watch the AI "think" through multiple stages (Market Analysis, Technical Scan, News Correlation) before providing an answer.
*   **SSE Token Streaming**: ultra-fast, real-time response delivery using Server-Sent Events (SSE).
*   **Context-Aware**: Remembers user settings, trading preferences, and portfolio context.

### 🔐 Secure Architecture
*   **Supabase Auth**: Fully integrated Email/Password and Google OAuth authentication.
*   **User-Specific Data**: All settings, portfolios, and chat histories are securely stored and isolated per user.

---

## 🛠️ Tech Stack

### Frontend (Modern UI/UX)
*   **Framework**: [Vite](https://vitejs.dev/) + [React](https://reactjs.org/) (TypeScript)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Vanilla CSS for custom glassmorphism)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Components**: [Radix UI](https://www.radix-ui.com/) + [Shadcn UI](https://ui.shadcn.com/)
*   **Charts**: [Recharts](https://recharts.org/)

### Backend (High-Performance Core)
*   **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
*   **Real-time Logic**: Server-Sent Events (SSE) for AI streaming.
*   **Data Sources**: `yfinance` & Live Market Intelligence APIs.
*   **Timezone Handling**: `pytz` for precise IST market hour calculations.

### Database & Auth
*   **Provider**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + RLS)

---

## 🚀 Quick Start

### 1. Prerequisite
*   Node.js (v20+)
*   Python (v3.10+)
*   Supabase Account

### 2. Environment Setup
Create a `.env` file in the root and add:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend AI Keys
OPENAI_API_KEY=your_openai_key
# OR
GROQ_API_KEY=your_groq_key
```

### 3. Backend Installation
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### 4. Frontend Installation
```powershell
npm install
npm run dev
```

---

## 📂 Project Structure
```text
et-ai-trader-x-apex/
├── backend/            # FastAPI Backend
│   ├── app/            # Main application logic
│   │   ├── services/   # Business services (AI, DB, Portfolio)
│   │   ├── core/       # Configurations & Helpers
│   │   └── crew/       # CrewAI Agent Orchestrator
├── src/                # React Frontend
│   ├── components/     # UI Components (Navbar, Sidebar, Dashboard)
│   ├── pages/          # Core views (Portfolio, Assistant, Settings)
│   ├── contexts/       # React Contexts (Auth)
│   └── lib/            # Utility functions & Supabase Client
├── public/             # Static Assets (Logo, Favicon)
└── tests/              # Playwright E2E Tests
```

---

## 📄 License
This project is private and intended for administrative use by **ET AI Trader**.

---

*Built with ❤️ by the ET AI Trader Team.*
