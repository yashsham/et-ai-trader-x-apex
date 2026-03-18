from fastapi import APIRouter, HTTPException, Depends
from app.api.models.chat_model import ChatRequest, ChatResponse
from app.chat.chat_crew import ChatbotCrew

router = APIRouter()

@router.post("", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Handles chat queries using LlamaIndex RAG and CrewAI. 
    It runs sequentially to deliver accurate trading insights.
    """
    try:
        if not request.query:
            raise HTTPException(status_code=400, detail="Query cannot be empty")
        
        # Initialize and run the CrewAI Chatbot sequentially
        chat_crew = ChatbotCrew(query=request.query)
        result = chat_crew.run()
        
        return ChatResponse(response=result)
    except Exception as e:
        print("[Chat Endpoint Error]:", e)
        raise HTTPException(status_code=500, detail=str(e))
