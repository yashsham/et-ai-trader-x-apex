from fastapi import APIRouter, HTTPException, Depends
from app.api.models.chat_model import ChatRequest
from app.models.responses import StandardResponse, create_success_response, create_error_response
from app.services.chat_service import chat_service

router = APIRouter()

@router.post("", response_model=StandardResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Handles chat queries using LlamaIndex RAG and CrewAI. 
    Consolidated to use ChatService for cross-assistant consistency.
    """
    try:
        if not request.query:
            return create_error_response("Query cannot be empty", code="VALIDATION_ERROR")
        
        result = await chat_service.process_chat(request.query, language=request.language)
        return create_success_response(result, source_metadata={"source": "ChatService"})
    except Exception as e:
        print("[Chat Endpoint Error]:", e)
        return create_error_response(str(e), code="CHAT_EXECUTION_ERROR")

@router.get("/history", response_model=StandardResponse)
async def get_chat_history():
    """Fetch chat history from service."""
    try:
        history = chat_service.get_chat_history()
        return create_success_response(history)
    except Exception as e:
        return create_error_response(str(e))
