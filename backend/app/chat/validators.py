from typing import List, Optional
from pydantic import BaseModel, Field, validator

class TradingAnalysisSchema(BaseModel):
    """Schema for the final decision agent output."""
    core_insight: str = Field(..., description="A high-conviction market summary.")
    technical_bullets: List[str] = Field(..., min_items=2, description="At least two technical observations.")
    risk_notes: str = Field(..., description="Mandatory risk disclosures.")
    bottom_line: str = Field(..., description="Unified conclusion.")

    @validator('risk_notes')
    def must_contain_risk_warning(cls, v):
        keywords = ["risk", "capital", "loss", "warning", "disclaimer"]
        if not any(word in v.lower() for word in keywords):
            raise ValueError("Risk notes MUST contain a formal risk warning or disclaimer.")
        return v

def validate_trading_output(output: str) -> bool:
    """
    Used by CrewAI guardrails to ensure output quality.
    Note: Simple version for now, production would use Pydantic parsing.
    """
    keywords = ["### 💎 **THE CORE ALIGNMENT**", "### 🛡️ **RISK SPECTRUM**", "BOTTOM LINE"]
    return all(k in output for k in keywords)
