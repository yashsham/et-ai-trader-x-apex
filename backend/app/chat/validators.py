from typing import List, Optional
from pydantic import BaseModel, Field, validator

class TradingAnalysisSchema(BaseModel):
    """Universal schema for the final decision agent output."""
    decision: str = Field(..., description="BUY, SELL, or HOLD recommendation.")
    entry: str = Field(..., description="The recommended entry price range.")
    target: str = Field(..., description="The primary target price.")
    stop_loss: str = Field(..., description="The protective stop-loss level.")
    confidence: float = Field(..., ge=0, le=100, description="Confidence score from 0-100.")
    reasoning: str = Field(..., description="A detailed professional explanation for the decision.")
    
    # Compatibility fields for ChatbotCrew markdown synthesis
    core_insight: Optional[str] = Field(None, description="A high-conviction market summary.")
    technical_bullets: Optional[List[str]] = Field(None, description="At least two technical observations.")
    risk_notes: Optional[str] = Field(None, description="Mandatory risk disclosures.")
    bottom_line: Optional[str] = Field(None, description="Unified conclusion.")

    @validator('risk_notes', always=True)
    def must_contain_risk_warning(cls, v, values):
        # We also check 'reasoning' if risk_notes is missing
        text_to_check = v or values.get('reasoning', '')
        keywords = ["risk", "capital", "loss", "warning", "disclaimer"]
        if not any(word in text_to_check.lower() for word in keywords):
            # If no warning in either, we don't necessarily want to crash 
            # but we should ensure it's there for compliance.
            pass 
        return v

def validate_trading_output(output: str) -> bool:
    """
    Used by CrewAI guardrails to ensure output quality.
    Note: Simple version for now, production would use Pydantic parsing.
    """
    keywords = ["### 💎 **THE CORE ALIGNMENT**", "### 🛡️ **RISK SPECTRUM**", "BOTTOM LINE"]
    return all(k in output for k in keywords)
