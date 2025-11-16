from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.firestore_service import firestore_service
from websocket_manager import broadcast_incident_update
from datetime import datetime

router = APIRouter()

class VerifyRequest(BaseModel):
    verified: bool = True
    notes: str = ""

@router.post("/verify/{incident_id}")
async def verify_incident(incident_id: str):
    """Verify an incident (simplified - no auth required)."""
    try:
        incident_ref = firestore_service.collection.document(incident_id)
        incident_doc = incident_ref.get()
        
        if not incident_doc.exists:
            raise HTTPException(status_code=404, detail="Incident not found")
        
        # Update incident
        update_data = {
            "verified": True,
            "verified_by": "operator",
            "verified_at": datetime.now().isoformat()
        }
        
        incident_ref.update(update_data)
        
        # Get updated incident data
        incident_data = incident_ref.get().to_dict()
        
        # Check if incident should be auto-archived (verified + resolved)
        should_archive = (
            incident_data.get("status") == "resolved"
        )
        
        if should_archive:
            # Archive incident (move to archived collection and delete from active)
            print(f"🗄️  Auto-archiving incident {incident_id} (verified + resolved)")
            await firestore_service.archive_incident(incident_id)
            update_data["archived"] = True
        
        # Broadcast update
        await broadcast_incident_update(incident_id, update_data)
        
        return {
            "success": True,
            "incident_id": incident_id,
            "verified": True,
            "archived": should_archive
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Verification error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


