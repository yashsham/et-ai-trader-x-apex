from fastapi import APIRouter, HTTPException
from app.services.chart_service import chart_intelligence_service
from app.models.responses import StandardResponse, create_success_response, create_error_response

router = APIRouter()

@router.get("/{symbol}", response_model=StandardResponse)
async def get_chart_intelligence(symbol: str, period: str = "3mo", lang: str = "English"):
    """Fetch full chart intelligence (OHLCV + Indicators + AI Analysis)."""
    try:
        data = chart_intelligence_service.get_chart_analysis(symbol, period=period, language=lang)
        return create_success_response(data, source_metadata={"source": "ChartIntelligence"})
    except Exception as e:
        return create_error_response(str(e), code="CHART_ERROR")

@router.get("/{symbol}/indicators", response_model=StandardResponse)
async def get_chart_indicators(symbol: str, period: str = "3mo", lang: str = "English"):
    """Fetch only the technical indicators for a symbol."""
    data = chart_intelligence_service.get_chart_analysis(symbol, period=period, language=lang)
    return create_success_response({
        "symbol": symbol.upper(),
        "indicators": data.get("chartData", [])[-1].get("indicators") if data.get("chartData") else {}
    })

@router.get("/{symbol}/levels", response_model=StandardResponse)
async def get_chart_levels(symbol: str, lang: str = "English"):
    """Fetch detected support and resistance levels."""
    data = chart_intelligence_service.get_chart_analysis(symbol, language=lang)
    return create_success_response(data.get("levels"))

@router.get("/{symbol}/analysis", response_model=StandardResponse)
async def get_chart_analysis_only(symbol: str, lang: str = "English"):
    """Fetch deep AI technical analysis without sending full chart data."""
    data = chart_intelligence_service.get_chart_analysis(symbol, language=lang)
    return create_success_response(data.get("analysis"))

@router.get("/{symbol}/backtest", response_model=StandardResponse)
async def get_chart_backtest(symbol: str, lang: str = "English"):
    """Placeholder for algorithmic backtest results."""
    return create_success_response({
        "symbol": symbol,
        "strategy": "EMA Crossover (20/50)",
        "win_rate": "62%",
        "profit_factor": 1.8,
        "status": "Alpha"
    })
