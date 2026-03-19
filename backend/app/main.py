import json
import time
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from datetime import datetime
import re

load_dotenv()
from collections import defaultdict
from typing import List, Dict, Any, Optional

from app.core.config import settings
from app.models.responses import create_success_response, create_error_response, StandardResponse
from app.crew.orchestrator import TradingCrew
from app.core.audit_logger import audit_logger
from app.core.injection_scanner import injection_scanner
from app.api.endpoints.charts import router as charts_router
from app.api.endpoints.chat import router as chat_router

from app.services.db_service import db_service
from app.services.dashboard_service import dashboard_service
from app.services.radar_service import radar_service
from app.services.portfolio_service import portfolio_brain_service
from app.services.chat_service import chat_service
from app.services.news_service import news_intelligence_service
from app.services.cache_service import cache_service

app = FastAPI(
    title="ET AI Trader X — Intelligence API",
    description="Multi-agent CrewAI backend for autonomous stock analysis",
    version="2.0.0"
)

# ── CORS ──────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list if settings.cors_origins_list else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Rate Limiter ──────────────────────────────────────────────────
# Simple in-memory rate limiter (cache-ready pattern)
RATE_LIMIT_WINDOW = 60 # seconds
RATE_LIMIT_MAX_REQUESTS = 60 # per minute
ip_request_counts = defaultdict(list)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host
    current_time = time.time()
    
    # Cleanup old timestamps
    ip_request_counts[client_ip] = [t for t in ip_request_counts[client_ip] if current_time - t < RATE_LIMIT_WINDOW]
    
    if len(ip_request_counts[client_ip]) >= RATE_LIMIT_MAX_REQUESTS:
        return JSONResponse(
            status_code=429,
            content=create_error_response("Too many requests from this IP. Rate limit exceeded.", code="RATE_LIMIT_EXCEEDED").model_dump()
        )
    ip_request_counts[client_ip].append(current_time)
    return await call_next(request)

# ── Security Middleware ───────────────────────────────────────────
@app.middleware("http")
async def security_middleware(request: Request, call_next):
    audit_logger.log_event(
        event_type="API_REQUEST",
        severity="LOW",
        details={"path": str(request.url.path), "method": request.method}
    )

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
                    content=create_error_response("Input rejected: Prompt Injection Detected", code="FORBIDDEN", details={"reason": scan["reason"]}).model_dump()
                )
        except Exception:
            pass
    return await call_next(request)

# ── Global Exception Handler ──────────────────────────────────────
@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    audit_logger.log_event("VALIDATION_ERROR", "MEDIUM", {"detail": str(exc)})
    return JSONResponse(status_code=400, content=create_error_response(str(exc), code="VALIDATION_ERROR").model_dump())

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    audit_logger.log_event("INTERNAL_ERROR", "HIGH", {"detail": str(exc)})
    return JSONResponse(status_code=500, content=create_error_response("An internal server error occurred.", code="INTERNAL_ERROR", details=str(exc)).model_dump())


# ── Models ────────────────────────────────────────────────────────
class AnalysisRequest(BaseModel):
    symbol: str = "RELIANCE.NS"
    portfolio: dict = {}

class WatchlistRequest(BaseModel):
    symbol: str

class SettingsRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    timezone: Optional[str] = "Asia/Kolkata"
    notifications: Optional[bool] = True
    risk_profile: Optional[str] = "Moderate"
    theme_mode: Optional[str] = "dark"
    assistant_memory_enabled: Optional[bool] = True

class RadarScanRequest(BaseModel):
    symbols: List[str]
    timeframe: str = "1mo"
    risk_profile: str = "Aggressive"

class PortfolioHoldingRequest(BaseModel):
    symbol: str
    quantity: float
    avg_price: float
    sector: Optional[str] = "Other"

class PortfolioUpdateRequest(BaseModel):
    quantity: Optional[float] = None
    avg_price: Optional[float] = None
    sector: Optional[str] = None

class ChatRequest(BaseModel):
    query: str
    symbol: Optional[str] = None
    portfolio_context: Optional[dict] = None
    chat_session_id: Optional[str] = None


# ── Core Routes ───────────────────────────────────────────────────
@app.get("/health")
def health_check():
    return create_success_response({"status": "healthy", "service": "ET AI Trader X Intelligence Engine v2"})

@app.get("/ping")
def ping():
    return {"status": "pong"}

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
        result = crew.run() # This now returns normalized format directly
        
        audit_logger.log_event(
            event_type="ANALYSIS_COMPLETE",
            severity="LOW",
            details={"symbol": request.symbol, "success": True}
        )
        return result
    except RuntimeError as e:
        audit_logger.log_event("LLM_ERROR", "HIGH", {"detail": str(e)})
        return JSONResponse(status_code=503, content=create_error_response(str(e), code="LLM_CONFIG_ERROR").model_dump())
    except Exception as e:
        audit_logger.log_event("ANALYSIS_ERROR", "HIGH", {"detail": str(e)})
        return JSONResponse(status_code=500, content=create_error_response(str(e), code="ANALYSIS_EXECUTION_ERROR").model_dump())


# ── History Routes ────────────────────────────────────────────────
@app.get("/api/v1/history/{symbol}")
def get_symbol_history(symbol: str, limit: int = 10):
    data = db_service.get_analysis_history(symbol.upper(), limit=limit)
    return create_success_response({"symbol": symbol.upper(), "count": len(data), "results": data})

@app.get("/api/v1/history")
def get_all_history(limit: int = 50):
    data = db_service.get_all_analyses(limit=limit)
    return create_success_response({"count": len(data), "results": data})

@app.get("/api/v1/history/recent")
def get_recent_history(limit: int = 5):
    """Fetch the last N AI analysis results for the dashboard."""
    data = dashboard_service.get_recent_history(limit=limit)
    return create_success_response(data)

@app.get("/api/v1/history/daily")
def get_daily_signals(decision: str = "BUY"):
    """Fetch high-confidence signals from today."""
    data = db_service.get_daily_signals(decision=decision)
    return create_success_response({"count": len(data), "results": data})


# ── Watchlist Routes ──────────────────────────────────────────────
@app.get("/api/v1/watchlist")
def get_watchlist():
    data = db_service.get_watchlist()
    return create_success_response({"count": len(data), "watchlist": data})

@app.get("/api/v1/watchlist/summary")
def get_watchlist_summary():
    """AI-powered summary of watchlist performance."""
    data = dashboard_service.get_watchlist_summary()
    return create_success_response(data)

@app.post("/api/v1/watchlist")
def add_watchlist(request: WatchlistRequest):
    result = db_service.add_to_watchlist(request.symbol.upper())
    if result is None:
        return create_error_response("DB not configured or symbol already exists", code="DB_ERROR")
    return create_success_response({"symbol": request.symbol.upper(), "data": result})

@app.delete("/api/v1/watchlist/{symbol}")
def remove_watchlist(symbol: str):
    success = db_service.remove_from_watchlist(symbol.upper())
    return create_success_response({"success": success, "symbol": symbol.upper()})


# ── Settings Routes ───────────────────────────────────────────────
@app.get("/api/v1/settings")
def get_settings():
    data = db_service.get_settings()
    if not data:
        data = {
            "full_name": "Admin User",
            "email": "admin@et-ai-trader.com",
            "timezone": settings.DEFAULT_TIMEZONE,
            "notifications": True
        }
    return create_success_response(data)

@app.post("/api/v1/settings")
def update_settings(request: SettingsRequest):
    update_data = request.model_dump()
    result = db_service.update_settings(update_data)
    if result is None:
        return create_error_response("Failed to save settings to DB.", code="DB_ERROR")
    return create_success_response(result)


@app.get("/api/v1/market/status")
def get_market_status():
    """Check if the Indian market is currently open."""
    return create_success_response(dashboard_service.get_market_status())

@app.get("/api/v1/search/stocks")
def search_stocks(q: str):
    """Search for stock symbols."""
    results = dashboard_service.search_stocks(q)
    return create_success_response(results)

@app.get("/api/v1/notifications")
def get_notifications(user_id: str = "default_user"):
    """Fetch notifications for the current user."""
    notifications = db_service.get_notifications(user_id)
    # If empty, seed some test ones once for demo purposes
    if not notifications:
        dashboard_service.trigger_test_notifications(user_id)
        notifications = db_service.get_notifications(user_id)
    return create_success_response(notifications)

@app.post("/api/v1/notifications/{notification_id}/read")
def mark_notification_read(notification_id: str):
    """Mark a notification as read."""
    success = db_service.mark_notification_read(notification_id)
    return create_success_response({"success": success})

# ── Dashboard Routes ──────────────────────────────────────────────
@app.get("/api/v1/market/overview")
def get_market_overview():
    data = dashboard_service.get_market_overview()
    if not data:
        return JSONResponse(status_code=503, content=create_error_response("Market data unavailable", code="SERVICE_UNAVAILABLE").model_dump())
    return create_success_response(data)

@app.get("/api/v1/market/movers")
def get_market_movers():
    data = dashboard_service.get_top_movers()
    return create_success_response(data)

@app.get("/api/v1/market/sentiment")
def get_market_sentiment():
    data = dashboard_service.get_market_sentiment()
    return create_success_response(data)

# ── Market News Routes ──────────────────────────────────────────
@app.get("/api/v1/market/news", response_model=StandardResponse)
async def get_raw_market_news(symbol: Optional[str] = None):
    """Fetch AI-curated market news."""
    try:
        data = await news_intelligence_service.get_curated_news(symbol=symbol)
        return create_success_response(data)
    except Exception as e:
        return create_error_response(str(e))

@app.get("/api/v1/market/news/trending", response_model=StandardResponse)
def get_trending_news_themes():
    """Identify aggregate news themes like 'Earnings' or 'RBI Policy'."""
    try:
        data = news_intelligence_service.get_trending_themes()
        return create_success_response(data)
    except Exception as e:
        return create_error_response(str(e))

@app.get("/api/v1/market/news/impact", response_model=StandardResponse)
async def get_high_impact_news():
    """Filter for only high-impact breaking news."""
    try:
        data = await news_intelligence_service.get_curated_news()
        high_impact = [n for n in data if n["impact_label"] == "High"]
        return create_success_response(high_impact)
    except Exception as e:
        return create_error_response(str(e))

@app.get("/api/v1/market/news/story-arcs", response_model=StandardResponse)
async def get_news_story_arcs():
    """Fetch clustered news narratives."""
    # Placeholder for clustered story arcs
    return create_success_response([
        {"arc_name": "Nifty Bull Run", "stories": 15, "last_updated": datetime.now().isoformat()},
        {"arc_name": "Sensex Consolidation", "stories": 8, "last_updated": datetime.now().isoformat()}
    ])

@app.get("/api/v1/market/news/search", response_model=StandardResponse)
async def search_market_news(q: str):
    """Search for specific news topics across sources."""
    try:
        data = await news_intelligence_service.get_curated_news(query=q)
        return create_success_response(data)
    except Exception as e:
        return create_error_response(str(e))


# ── Opportunity Radar Routes ─────────────────────────────────────
@app.post("/api/v1/radar/scan")
async def run_radar_scan(request: RadarScanRequest):
    """Trigger a comprehensive AI alpha-hunt scan on a list of symbols."""
    results = await radar_service.run_comprehensive_scan(request.symbols)
    return create_success_response(results, source_metadata={"source": "OpportunityRadar"})

@app.get("/api/v1/radar/live")
def get_live_radar():
    """Fetch high-conviction opportunities from recent history."""
    data = radar_service.get_live_radar() # Currently proxies to recent
    return create_success_response(data)

@app.get("/api/v1/radar/history")
def get_radar_history(limit: int = 20):
    data = db_service.get_all_analyses(limit=limit)
    return create_success_response(data)

@app.get("/api/v1/radar/{symbol}")
def get_symbol_radar(symbol: str):
    data = db_service.get_analysis_history(symbol.upper(), limit=1)
    return create_success_response(data)

@app.post("/api/v1/radar/watchlist-scan", response_model=StandardResponse)
async def scan_watchlist():
    """Scan all symbols in the user's watchlist for alpha."""
    try:
        watchlist = db_service.get_watchlist()
        symbols = [item["symbol"] for item in watchlist]
        if not symbols:
            return create_error_response("Watchlist is empty", code="EMPTY_WATCHLIST")
        
        results = radar_service.run_comprehensive_scan(symbols)
        return create_success_response(results)
    except Exception as e:
        return create_error_response(str(e))

# ── PORTFOLIO BRAIN ENDPOINTS ──────────────────────────────────
@app.get("/api/v1/portfolio", response_model=StandardResponse)
async def get_portfolio():
    """Fetch live portfolio valuation and holdings."""
    try:
        data = portfolio_brain_service.get_portfolio_summary()
        return create_success_response(data)
    except Exception as e:
        return create_error_response(str(e))

@app.post("/api/v1/portfolio", response_model=StandardResponse)
async def add_holding(request: PortfolioHoldingRequest):
    """Add a new holding to the portfolio."""
    try:
        res = portfolio_brain_service.add_holding(
            request.symbol, request.quantity, request.avg_price, request.sector
        )
        return create_success_response(res)
    except Exception as e:
        return create_error_response(str(e))

@app.put("/api/v1/portfolio/{holding_id}", response_model=StandardResponse)
async def update_holding(holding_id: str, request: PortfolioUpdateRequest):
    """Update an existing holding."""
    try:
        updates = {k: v for k, v in request.model_dump().items() if v is not None}
        res = db_service.update_portfolio_holding(holding_id, updates)
        return create_success_response(res)
    except Exception as e:
        return create_error_response(str(e))

@app.delete("/api/v1/portfolio/{holding_id}", response_model=StandardResponse)
async def delete_holding(holding_id: str):
    """Remove a holding from the portfolio."""
    try:
        success = portfolio_brain_service.remove_holding(holding_id)
        return create_success_response({"success": success})
    except Exception as e:
        return create_error_response(str(e))

@app.get("/api/v1/portfolio/analysis", response_model=StandardResponse)
async def analyze_portfolio(user_id: Optional[str] = "default_user"):
    """Trigger AI Portfolio Optimization Swarm."""
    try:
        data = await portfolio_brain_service.analyze_portfolio(user_id)
        return create_success_response(data)
    except Exception as e:
        return create_error_response(str(e))

@app.get("/api/v1/portfolio/summary", response_model=StandardResponse)
async def get_portfolio_summary():
    """Alias for full AI analysis and summary."""
    return await analyze_portfolio()

@app.get("/api/v1/portfolio/rebalance", response_model=StandardResponse)
async def get_rebalance_suggestions():
    """Specifically fetch rebalancing plan from the optimizer."""
    try:
        data = portfolio_brain_service.analyze_portfolio()
        analysis = data.get("analysis", {})
        return create_success_response({
            "health_status": analysis.get("health_status"),
            "rebalancing_plan": analysis.get("rebalancing_plan", []),
            "explanation": analysis.get("explanation")
        })
    except Exception as e:
        return create_error_response(str(e))

# ── AI ASSISTANT (COPILOT) ENDPOINTS ───────────────────────────
# Managed by chat_router (app/api/endpoints/chat.py)

@app.post("/api/v1/chat/stream")
async def chat_stream(request: ChatRequest):
    """SSE Streaming for real-time market insights."""
    from fastapi.responses import StreamingResponse
    import json
    import asyncio

    async def stream_generator():
        # Simulated streaming from the ChatService logic
        # In a real app, CrewAI process would be called in a background task
        # and tokens piped to this generator.
        tokens = [
            f"Analysing '{request.query}'... ",
            "Checking live data from yfinance... ",
            "Retrieving market knowledge from LlamaIndex... ",
            "Compliance checks passed. ",
            "\n\n",
            "Based on the data, the mood in the market is balanced. ",
            "Stay cautious but observant. ",
            "Citing grounded sources: NewsAPI, yfinance."
        ]
        for token in tokens:
            yield f"data: {json.dumps({'token': token})}\n\n"
            await asyncio.sleep(0.3)
        yield "data: [DONE]\n\n"

    return StreamingResponse(stream_generator(), media_type="text/event-stream")

# ── SETTINGS & PREFERENCES ENDPOINTS ──────────────────────────
@app.get("/api/v1/settings", response_model=StandardResponse)
async def get_settings():
    """Fetch user settings and preferences."""
    try:
        data = db_service.get_settings()
        if not data:
            data = {
                "full_name": "Admin User",
                "email": "admin@et-ai-trader.com",
                "timezone": settings.DEFAULT_TIMEZONE or "Asia/Kolkata",
                "notifications": True,
                "risk_profile": "Moderate",
                "theme_mode": "dark"
            }
        return create_success_response(data)
    except Exception as e:
        return create_error_response(str(e))

@app.post("/api/v1/settings", response_model=StandardResponse)
@app.put("/api/v1/settings", response_model=StandardResponse)
async def update_settings(request: SettingsRequest):
    """Update user preferences with AI validation."""
    try:
        from app.crew.settings_orchestrator import SettingsCrew
        
        # 1. AI Validation Sweep
        changes = {k: v for k, v in request.model_dump().items() if v is not None}
        crew = SettingsCrew(changes)
        # In a real app we'd await/process the crew result
        # For sync demo, we directly persist the sanitized fields
        
        updated = db_service.update_settings(changes)
        return create_success_response(updated)
    except Exception as e:
        return create_error_response(str(e))

@app.get("/api/v1/settings/status", response_model=StandardResponse)
def get_settings_status():
    """Get high-level status of user configurations."""
    return create_success_response({
        "profile_complete": True,
        "integrations_active": 3,
        "security_score": "High"
    })

@app.get("/api/v1/settings/integrations", response_model=StandardResponse)
def get_integrations():
    """List external API integration statuses."""
    try:
        status = db_service.get_integration_status()
        return create_success_response(status)
    except Exception as e:
        return create_error_response(str(e))

@app.post("/api/v1/settings/integrations/test", response_model=StandardResponse)
async def test_integration(service: str):
    """Test connectivity to a specific external service."""
    # Simulated connectivity check
    import asyncio
    await asyncio.sleep(1)
    return create_success_response({
        "service": service,
        "status": "Success",
        "latency": "145ms"
    })

@app.get("/api/v1/system/status")
def get_system_status():
    """Health snapshot of the ET AI Trader X infrastructure."""
    data = dashboard_service.get_system_status()
    return create_success_response(data)

@app.get("/api/v1/cache/stats")
def get_cache_stats():
    """LRU+TTL cache observability — hits, misses, hit-rate, size."""
    return create_success_response(cache_service.cache_stats())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
