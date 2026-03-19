import json
from typing import Any, Dict
from app.models.responses import create_success_response, create_error_response, StandardResponse

class ResponseNormalizer:
    @staticmethod
    def normalize(result: Any, source: str = "ai_agent", confidence: float = None, **kwargs) -> StandardResponse:
        """
        Takes raw output (from an agent, an API, or a dictionary)
        and normalizes it into our production StandardResponse format.
        """
        # If it's already a StandardResponse, just return it
        if isinstance(result, StandardResponse):
            return result
            
        data = result
        # If it's a string, try parsing as JSON.
        if isinstance(result, str):
            try:
                # 1. Clean up markdown blocks if present
                import re
                json_match = re.search(r"(\{.*\})", result, re.DOTALL)
                clean_content = json_match.group(1) if json_match else result
                data = json.loads(clean_content)
            except Exception as e:
                # If it can't be parsed, it's just raw text
                print(f"[Normalizer] JSON parse failed: {e}. Returning raw_text.")
                data = {"raw_text": result}
        
        # Build metadata
        metadata = {"source": source}
        metadata.update(kwargs)
        return create_success_response(
            data=data,
            source_metadata=metadata,
            confidence=confidence
        )

response_normalizer = ResponseNormalizer()
