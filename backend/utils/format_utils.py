from datetime import datetime
from typing import Dict, Any

def format_incident_response(incident_data: Dict[str, Any]) -> Dict[str, Any]:
    """Format incident data for API response."""
    lat = incident_data.get("lat") or incident_data.get("latitude", 0)
    lng = incident_data.get("lng") or incident_data.get("longitude", 0)
    location = incident_data.get("location") or incident_data.get("location_text") or f"Location ({lat:.4f}, {lng:.4f})"
    
    return {
        "id": incident_data.get("id"),
        "type": incident_data.get("type"),
        "latitude": lat,
        "longitude": lng,
        "lat": lat,  # Keep for backward compatibility
        "lng": lng,
        "confidence": incident_data.get("confidence"),
        "urgency": incident_data.get("urgency"),
        "description": incident_data.get("description"),
        "image_url": incident_data.get("image_url"),
        "location": location,
        "location_text": location,
        "people_affected": incident_data.get("people_affected", 0),
        "verified": incident_data.get("verified", False),
        "timestamp": incident_data.get("timestamp", datetime.utcnow().isoformat())
    }

def determine_urgency(confidence: float, incident_type: str, people_affected: int = 0) -> str:
    """Determine urgency level based on incident characteristics."""
    if confidence >= 0.85 and incident_type in ["fire", "collapsed_building", "flood"]:
        return "high"
    elif confidence >= 0.7 or people_affected > 10:
        return "medium"
    else:
        return "low"
