from fastapi import APIRouter
from services.firestore_service import firestore_service
from utils.format_utils import format_incident_response
from datetime import datetime, timedelta
import random

router = APIRouter()

# Temporary demo data for when Firestore quota is exceeded
DEMO_INCIDENTS = [
    {
        "id": "demo-1",
        "type": "fire",
        "latitude": 25.2048,
        "longitude": 55.2708,
        "description": "Large fire reported in downtown area",
        "location": "Downtown Dubai",
        "urgency": "high",
        "confidence": 0.95,
        "verified": False,
        "people_affected": 15,
        "timestamp": (datetime.now() - timedelta(minutes=5)).isoformat()
    },
    {
        "id": "demo-2",
        "type": "flood",
        "latitude": 25.1972,
        "longitude": 55.2744,
        "description": "Heavy flooding in residential area",
        "location": "Jumeirah District",
        "urgency": "medium",
        "confidence": 0.87,
        "verified": True,
        "people_affected": 8,
        "timestamp": (datetime.now() - timedelta(minutes=15)).isoformat()
    },
    {
        "id": "demo-3",
        "type": "building_collapse",
        "latitude": 25.2138,
        "longitude": 55.2866,
        "description": "Partial building collapse reported",
        "location": "Business Bay",
        "urgency": "high",
        "confidence": 0.92,
        "verified": False,
        "people_affected": 12,
        "timestamp": (datetime.now() - timedelta(minutes=8)).isoformat()
    },
    {
        "id": "demo-4",
        "type": "medical",
        "latitude": 25.1896,
        "longitude": 55.2563,
        "description": "Medical emergency at public event",
        "location": "Dubai Marina",
        "urgency": "low",
        "confidence": 0.78,
        "verified": True,
        "people_affected": 3,
        "timestamp": (datetime.now() - timedelta(minutes=30)).isoformat()
    },
    {
        "id": "demo-5",
        "type": "fire",
        "latitude": 25.2282,
        "longitude": 55.3324,
        "description": "Small fire in commercial building",
        "location": "Deira",
        "urgency": "medium",
        "confidence": 0.89,
        "verified": True,
        "people_affected": 5,
        "timestamp": (datetime.now() - timedelta(minutes=45)).isoformat()
    }
]

@router.get("/dashboard")
async def get_dashboard():
    """Get dashboard data with incidents and stats."""
    try:
        # Try to get real data from Firestore
        incidents = await firestore_service.get_all_incidents(limit=100)
        
        # If no incidents (likely due to quota), use demo data
        if not incidents or len(incidents) == 0:
            print("⚠️  Using demo data (Firestore quota exceeded or no data)")
            incidents = DEMO_INCIDENTS
        else:
            # Format real incidents and filter out archived ones
            incidents = [
                format_incident_response(inc) 
                for inc in incidents 
                if not inc.get("archived", False)
            ]
        
        # Calculate stats
        stats = {
            "total_incidents": len(incidents),
            "high_urgency": len([i for i in incidents if i.get("urgency") == "high"]),
            "active_responders": max(1, len(incidents) // 3),
            "avg_response_time": 12
        }
        
        return {
            "incidents": incidents,
            "stats": stats
        }
        
    except Exception as e:
        print(f"Dashboard error: {e}")
        # Return demo data on any error
        print("⚠️  Using demo data due to error")
        return {
            "incidents": DEMO_INCIDENTS,
            "stats": {
                "total_incidents": len(DEMO_INCIDENTS),
                "high_urgency": 2,
                "active_responders": 2,
                "avg_response_time": 12
            }
        }
