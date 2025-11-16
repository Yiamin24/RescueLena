from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.firestore_service import firestore_service
from websocket_manager import broadcast_incident_update
from datetime import datetime

router = APIRouter()

class StatusUpdate(BaseModel):
    status: str  # pending, in_progress, resolved, false_alarm

@router.put("/status/{incident_id}")
async def update_incident_status(incident_id: str, update: StatusUpdate):
    """Update incident status (simplified - no auth required)."""
    try:
        status = update.status
        
        # Validate status
        valid_statuses = ["pending", "in_progress", "resolved", "false_alarm"]
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        
        # Prepare update data
        update_data = {
            "status": status,
            "updated_at": datetime.now().isoformat()
        }
        
        if status == "resolved":
            update_data["resolved_at"] = datetime.now().isoformat()
        
        # Update in Firestore
        incident_ref = firestore_service.collection.document(incident_id)
        incident_doc = incident_ref.get()
        
        if not incident_doc.exists:
            raise HTTPException(status_code=404, detail="Incident not found")
        
        incident_ref.update(update_data)
        
        # Check if incident should be auto-archived (resolved + verified)
        incident_data = incident_ref.get().to_dict()
        should_archive = (
            status == "resolved" and 
            incident_data.get("verified", False)
        )
        
        if should_archive:
            # Archive incident (move to archived collection and delete from active)
            print(f"🗄️  Auto-archiving incident {incident_id} (resolved + verified)")
            await firestore_service.archive_incident(incident_id)
            update_data["archived"] = True
        
        # Broadcast update via WebSocket
        await broadcast_incident_update(incident_id, update_data)
        
        return {
            "success": True,
            "incident_id": incident_id,
            "status": status,
            "archived": should_archive
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

