from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.social_media_service import social_media_service
from services.gemini_service import gemini_service
from services.firestore_service import firestore_service
from services.qdrant_service import qdrant_service
from utils.format_utils import determine_urgency, format_incident_response
from websocket_manager import broadcast_new_incident
import random

router = APIRouter()

class SocialPostRequest(BaseModel):
    text: str
    source: str = "twitter"
    user: str = "anonymous"
    location: str = None

@router.post("/social/analyze")
async def analyze_social_post(request: SocialPostRequest):
    """Analyze a social media post for disaster information."""
    try:
        # Analyze post with AI
        analysis = await social_media_service.analyze_post(request.text)
        
        # Use Gemini for better analysis
        gemini_analysis = await gemini_service.analyze_text(request.text)
        
        # Merge results (prefer Gemini's analysis)
        incident_type = gemini_analysis.get('type', analysis['type'])
        urgency = gemini_analysis.get('urgency', analysis['urgency'])
        description = gemini_analysis.get('description', analysis['description'])
        location_text = request.location or gemini_analysis.get('location_text', analysis['location_text'])
        
        # Generate coordinates (in production, use geocoding API)
        lat = 25.2048 + random.uniform(-0.1, 0.1)
        lng = 55.2708 + random.uniform(-0.1, 0.1)
        
        # Generate embedding
        embedding_text = f"{incident_type} {description}"
        embedding = await gemini_service.generate_embedding(embedding_text)
        
        # Prepare incident data
        incident_data = {
            "type": incident_type,
            "lat": lat,
            "lng": lng,
            "confidence": 0.65,  # Social media has lower confidence
            "urgency": urgency,
            "description": f"[Social Media] {description}",
            "people_affected": 0,
            "image_url": None,
            "location_text": location_text,
            "source": request.source,
            "source_user": request.user,
            "verified": False  # Social media posts start unverified
        }
        
        # Store in Firestore
        incident_id = await firestore_service.store_incident(incident_data)
        
        # Store embedding in Qdrant
        await qdrant_service.store_embedding(incident_id, embedding, incident_data)
        
        # Return formatted response
        incident_data['id'] = incident_id
        response = format_incident_response(incident_data)
        
        # Broadcast to WebSocket clients
        await broadcast_new_incident(response)
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/social/monitor/start")
async def start_social_monitoring():
    """Start monitoring social media for disaster posts."""
    try:
        # In production, this would start the Twitter stream
        return {
            "success": True,
            "message": "Social media monitoring started",
            "note": "Add Twitter API credentials to enable real-time monitoring"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/social/monitor/stop")
async def stop_social_monitoring():
    """Stop monitoring social media."""
    try:
        social_media_service.stop_monitoring()
        return {
            "success": True,
            "message": "Social media monitoring stopped"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
