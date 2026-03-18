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

from app.crew.orchestrator import TradingCrew
from app.core.audit_logger import audit_logger
from app.core.injection_scanner import injection_scanner

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


# ── Routes ────────────────────────────────────────────────────────
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ET AI Trader X Intelligence Engine v2"}


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
        return {"symbol": request.symbol, "decision_output": str(result), "success": True}
    except RuntimeError as e:
        # No LLM key configured
        audit_logger.log_event("LLM_ERROR", "HIGH", {"detail": str(e)})
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        audit_logger.log_event("ANALYSIS_ERROR", "HIGH", {"detail": str(e)})
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
