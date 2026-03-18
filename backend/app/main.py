from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.crew.orchestrator import TradingCrew
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="ET AI Trader X API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    symbol: str
    portfolio: dict = {}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ET AI Trader X Intelligence"}

@app.post("/api/v1/analyze-stock")
async def analyze_stock(request: AnalysisRequest):
    try:
        crew = TradingCrew(request.symbol, request.portfolio)
        result = crew.run()
        # Extract the final decision output (CrewAI returns a string result from the last task)
        return {
            "symbol": request.symbol,
            "decision_output": result,
            "success": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
