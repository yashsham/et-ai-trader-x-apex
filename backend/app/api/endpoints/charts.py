from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from pydantic import BaseModel
from app.services.chart_service import chart_intelligence_service

router = APIRouter()

class ChartIntelligenceResponse(BaseModel):
    symbol: str
    chartData: List[Dict[str, Any]]
    analysis: Dict[str, Any]

@router.get("/{symbol}", response_model=ChartIntelligenceResponse)
async def get_chart_intelligence(symbol: str, period: str = "1mo"):
    """
    Fetch OHLCV chart data and real-time AI technical analysis 
    for the requested symbol.
    """
    try:
        data = chart_intelligence_service.get_chart_data_and_analysis(symbol, period=period)
        return ChartIntelligenceResponse(**data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print("[Chart Intelligence Error]:", e)
        raise HTTPException(status_code=500, detail="Internal server error executing chart analysis")
