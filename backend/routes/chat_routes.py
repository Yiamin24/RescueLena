from fastapi import APIRouter, HTTPException
from models.incident_model import ChatRequest
from services.gemini_service import gemini_service
from services.firestore_service import firestore_service
import json

router = APIRouter()

@router.post("/chat")
async def chat(request: ChatRequest):
    """AI chat assistant for rescue operators."""
    try:
        # Get recent incidents for context
        incidents = await firestore_service.get_all_incidents(limit=20)
        
        # Format context
        context = json.dumps(incidents, indent=2)
        
        # Generate response
        response = await gemini_service.chat_response(request.message, context)
        
        return {
            "message": request.message,
            "response": response
        }
    except Exception as e:
        print(f"Error in chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))
