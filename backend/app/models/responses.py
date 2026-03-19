from typing import Any, Dict, Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
import pytz

class StandardResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[Any] = None
    timestamp: str = Field(default_factory=lambda: datetime.now(pytz.UTC).isoformat())
    source_metadata: Optional[Dict[str, Any]] = None
    confidence: Optional[float] = None
    explanation: Optional[str] = None

class ErrorDetail(BaseModel):
    message: str
    code: Optional[str] = None
    details: Optional[Any] = None

def create_success_response(data: Any, source_metadata: Optional[Dict[str, Any]] = None, confidence: Optional[float] = None, explanation: Optional[str] = None) -> StandardResponse:
    return StandardResponse(
        success=True,
        data=data,
        source_metadata=source_metadata,
        confidence=confidence,
        explanation=explanation
    )

def create_error_response(message: str, code: str = "ERROR", details: Any = None) -> StandardResponse:
    return StandardResponse(
        success=False,
        error=ErrorDetail(message=message, code=code, details=details)
    )
