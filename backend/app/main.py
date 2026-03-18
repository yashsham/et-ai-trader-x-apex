"""
ET AI Trader X — FastAPI Backend
Production-grade patterns adapted from yash-genai-prod-os:
  - Security middleware with prompt injection scanning
  - Structured audit logging (ConsoleJSONLogger pattern)
  - Rate-limit-ready CORS + global exception handling
  - SecureModelRouter-inspired error handling on the analyze endpoint
"""
import json
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import re

from app.crew.orchestrator import TradingCrew
from app.core.audit_logger import audit_logger
from app.core.injection_scanner import injection_scanner
from app.services.db_service import db_service
from app.services.dashboard_service import dashboard_service
from app.api.endpoints.chat import router as chat_router
from app.api.endpoints.charts import router as charts_router

load_dotenv()

app = FastAPI(
    title="ET AI Trader X — Intelligence API",
    description="Multi-agent CrewAI backend for autonomous stock analysis",
    version="2.0.0"
)

# ── CORS ──────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Security Middleware (yash-genai-prod-os pattern) ──────────────
@app.middleware("http")
async def security_middleware(request: Request, call_next):
    audit_logger.log_event(
        event_type="API_REQUEST",
        severity="LOW",
        details={"path": str(request.url.path), "method": request.method}
    )

    # Inject-scan POST bodies hitting the analyze endpoint
    if request.method == "POST" and "analyze" in request.url.path:
        body_bytes = await request.body()
        try:
            body_json = json.loads(body_bytes)
            symbol = body_json.get("symbol", "")
            scan = injection_scanner.scan(symbol)
            if not scan["is_safe"]:
                audit_logger.log_event(
                    event_type="INJECTION_ATTEMPT",
                    severity="HIGH",
                    details={"reason": scan["reason"], "symbol": symbol}
                )
                return JSONResponse(
                    status_code=403,
                    content={"error": "Input rejected: Prompt Injection Detected", "reason": scan["reason"]}
                )
        except Exception:
            pass  # Malformed JSON — let FastAPI handle it

    return await call_next(request)


# ── Global Exception Handler ──────────────────────────────────────
@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    audit_logger.log_event("VALIDATION_ERROR", "MEDIUM", {"detail": str(exc)})
    return JSONResponse(status_code=400, content={"error": str(exc), "type": "ValidationError"})


# ── Models ────────────────────────────────────────────────────────
class AnalysisRequest(BaseModel):
    symbol: str = "RELIANCE.NS"
    portfolio: dict = {}

class WatchlistRequest(BaseModel):
    symbol: str

class SettingsRequest(BaseModel):
    full_name: str
    email: str
    timezone: str
    notifications: bool


# ── Core Routes ───────────────────────────────────────────────────
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ET AI Trader X Intelligence Engine v2"}

app.include_router(chat_router, prefix="/api/v1/chat", tags=["Chatbot"])
app.include_router(charts_router, prefix="/api/v1/charts", tags=["Charts"])


@app.post("/api/v1/analyze-stock")
async def analyze_stock(request: AnalysisRequest):
    audit_logger.log_event(
        event_type="ANALYSIS_START",
        severity="LOW",
        details={"symbol": request.symbol}
    )
    try:
        crew = TradingCrew(request.symbol, request.portfolio)
        result = crew.run()
        audit_logger.log_event(
            event_type="ANALYSIS_COMPLETE",
            severity="LOW",
            details={"symbol": request.symbol, "success": True}
        )
        
        result_str = str(result)
        parsed_data = {}
        try:
            # Attempt to extract JSON if LLM included markdown blocks
            json_match = re.search(r'\{.*\}', result_str, re.DOTALL)
            if json_match:
                parsed_data = json.loads(json_match.group(0))
            else:
                parsed_data = json.loads(result_str)
        except Exception as e:
            # Fallback if LLM failed to generate valid JSON
            print("Failed to parse CrewAI JSON output:", e)
            parsed_data = {
                "decision": "UNKNOWN",
                "entry": "N/A",
                "target": "N/A",
                "stop_loss": "N/A",
                "confidence": 50.0,
                "reasoning": result_str
            }
            
        return {"symbol": request.symbol, "decision_output": result_str, "parsed_data": parsed_data, "success": True}
    except RuntimeError as e:
        # No LLM key configured
        audit_logger.log_event("LLM_ERROR", "HIGH", {"detail": str(e)})
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        audit_logger.log_event("ANALYSIS_ERROR", "HIGH", {"detail": str(e)})
        raise HTTPException(status_code=500, detail=str(e))


# ── History Routes ────────────────────────────────────────────────
@app.get("/api/v1/history/{symbol}")
def get_symbol_history(symbol: str, limit: int = 10):
    """Fetch past AI analyses for a specific stock symbol."""
    data = db_service.get_analysis_history(symbol.upper(), limit=limit)
    return {"symbol": symbol.upper(), "count": len(data), "results": data}


@app.get("/api/v1/history")
def get_all_history(limit: int = 50):
    """Fetch all recent AI analyses across all symbols."""
    data = db_service.get_all_analyses(limit=limit)
    return {"count": len(data), "results": data}


# ── Watchlist Routes ──────────────────────────────────────────────
@app.get("/api/v1/watchlist")
def get_watchlist():
    """Get all symbols in the watchlist."""
    data = db_service.get_watchlist()
    return {"count": len(data), "watchlist": data}


@app.post("/api/v1/watchlist")
def add_watchlist(request: WatchlistRequest):
    """Add a symbol to the watchlist."""
    result = db_service.add_to_watchlist(request.symbol.upper())
    if result is None:
        return {"success": False, "message": "DB not configured or symbol already exists"}
    return {"success": True, "symbol": request.symbol.upper(), "data": result}


@app.delete("/api/v1/watchlist/{symbol}")
def remove_watchlist(symbol: str):
    """Remove a symbol from the watchlist."""
    success = db_service.remove_from_watchlist(symbol.upper())
    return {"success": success, "symbol": symbol.upper()}


# ── Settings Routes ───────────────────────────────────────────────
@app.get("/api/v1/settings")
def get_settings():
    """Get the current user configurations."""
    data = db_service.get_settings()
    if not data:
        # Return sensible defaults if DB not configured or row missing
        return {
            "full_name": "Admin User",
            "email": "admin@et-ai-trader.com",
            "timezone": "UTC",
            "notifications": True
        }
    return data


@app.post("/api/v1/settings")
def update_settings(request: SettingsRequest):
    """Update user configurations."""
    update_data = {
        "full_name": request.full_name,
        "email": request.email,
        "timezone": request.timezone,
        "notifications": request.notifications
    }
    result = db_service.update_settings(update_data)
    if result is None:
        raise HTTPException(status_code=500, detail="Failed to save settings to DB.")
    return {"success": True, "settings": result}


# ── Dashboard Routes ──────────────────────────────────────────────
@app.get("/api/v1/market/overview")
def get_market_overview():
    """Live index overview data for UI chart."""
    data = dashboard_service.get_market_overview()
    if not data:
        raise HTTPException(status_code=503, detail="Market data unavailable")
    return {"success": True, "data": data}

@app.get("/api/v1/market/movers")
def get_market_movers():
    """Live top gainers and losers."""
    data = dashboard_service.get_top_movers()
    return {"success": True, "data": data}

@app.get("/api/v1/market/sentiment")
def get_market_sentiment():
    """Live news-based market sentiment gauge score."""
    data = dashboard_service.get_market_sentiment()
    return {"success": True, "data": data}

@app.get("/api/v1/market/news")
def get_market_news():
    """Actual live feed of top finance news."""
    data = dashboard_service.get_market_news()
    return {"success": True, "data": data}

@app.get("/api/v1/portfolio")
def get_portfolio():
    """Live portfolio P&L engine pulling from Supabase and yfinance."""
    data = dashboard_service.get_live_portfolio()
    return {"success": True, "data": data}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
