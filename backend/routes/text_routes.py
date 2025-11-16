from fastapi import APIRouter, HTTPException
from models.incident_model import TextAnalysisRequest
from services.gemini_service import gemini_service
from services.qdrant_service import qdrant_service
from services.firestore_service import firestore_service
from utils.format_utils import format_incident_response

router = APIRouter()

@router.post("/analyze/text")
async def analyze_text(request: TextAnalysisRequest):
    """Extract incident information from text."""
    try:
        # Analyze text with Gemini
        analysis = await gemini_service.analyze_text(request.text)
        
        # Generate embedding
        embedding = await gemini_service.generate_embedding(request.text)
        
        # Prepare incident data
        incident_data = {
            "type": analysis['type'],
            "lat": None,
            "lng": None,
            "confidence": analysis['confidence'],
            "urgency": analysis['urgency'],
            "description": analysis['description'],
            "people_affected": analysis.get('people_affected', 0),
            "location_text": analysis.get('location_text'),
            "image_url": None
        }
        
        # Store in Firestore
        incident_id = await firestore_service.store_incident(incident_data)
        
        # Store embedding in Qdrant
        await qdrant_service.store_embedding(incident_id, embedding, incident_data)
        
        # Return formatted response
        incident_data['id'] = incident_id
        return format_incident_response(incident_data)
        
    except Exception as e:
        print(f"Error in text analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))
