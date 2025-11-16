from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.satellite_service import satellite_service
from services.gemini_service import gemini_service
from services.firestore_service import firestore_service
from services.qdrant_service import qdrant_service
from websocket_manager import broadcast_new_incident
from utils.format_utils import format_incident_response

router = APIRouter()

class SatelliteAnalysisRequest(BaseModel):
    latitude: float
    longitude: float
    radius_km: float = 5.0
    analysis_type: str = "all"  # all, fire, flood, damage

@router.post("/satellite/analyze")
async def analyze_satellite_imagery(request: SatelliteAnalysisRequest):
    """Analyze satellite imagery for disaster detection."""
    try:
        # Analyze area
        analysis = await satellite_service.analyze_area(
            request.latitude,
            request.longitude,
            request.radius_km
        )
        
        # Check for specific disaster types
        results = {
            "location": {"lat": request.latitude, "lng": request.longitude},
            "radius_km": request.radius_km,
            "analysis": analysis,
            "incidents_detected": []
        }
        
        if request.analysis_type in ["all", "fire"]:
            fires = await satellite_service.detect_fires(request.latitude, request.longitude)
            results["fires"] = fires
            
        if request.analysis_type in ["all", "flood"]:
            floods = await satellite_service.detect_floods(request.latitude, request.longitude)
            results["floods"] = floods
            
        if request.analysis_type in ["all", "damage"]:
            damage = await satellite_service.detect_building_damage(request.latitude, request.longitude)
            results["building_damage"] = damage
        
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/satellite/monitor")
async def start_satellite_monitoring(request: SatelliteAnalysisRequest):
    """Start monitoring an area with satellite imagery."""
    try:
        return {
            "success": True,
            "message": "Satellite monitoring configured",
            "location": {"lat": request.latitude, "lng": request.longitude},
            "note": "Add Google Earth Engine credentials to enable real-time satellite monitoring"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/satellite/status")
async def get_satellite_status():
    """Get satellite service status."""
    return {
        "service": "Google Earth Engine",
        "status": "configured",
        "available_datasets": [
            "Sentinel-2 (optical imagery)",
            "Sentinel-1 (SAR - all weather)",
            "MODIS (thermal/fire detection)",
            "VIIRS (active fires)",
            "Landsat (historical data)"
        ],
        "setup_required": True,
        "setup_guide": "See backend/services/satellite_service.py for setup instructions"
    }
