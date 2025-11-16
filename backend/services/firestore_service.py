import firebase_admin
from firebase_admin import credentials, firestore
from config import config
from typing import Dict, Any, List
from datetime import datetime
import uuid

class FirestoreService:
    def __init__(self):
        if not firebase_admin._apps:
            if config.FIREBASE_CREDENTIALS:
                cred = credentials.Certificate(config.FIREBASE_CREDENTIALS)
                firebase_admin.initialize_app(cred)
            else:
                print("Warning: Firebase credentials not configured")
        
        self.db = firestore.client()
        self.collection = self.db.collection('incidents')
    
    async def store_incident(self, incident_data: Dict[str, Any]) -> str:
        """Store incident metadata in Firestore."""
        try:
            incident_id = str(uuid.uuid4())
            incident_data['id'] = incident_id
            incident_data['timestamp'] = datetime.utcnow().isoformat()
            
            self.collection.document(incident_id).set(incident_data)
            return incident_id
        except Exception as e:
            print(f"Error storing incident: {e}")
            return str(uuid.uuid4())
    
    async def get_incident(self, incident_id: str) -> Dict[str, Any]:
        """Get incident by ID."""
        try:
            doc = self.collection.document(incident_id).get()
            if doc.exists:
                return doc.to_dict()
            return None
        except Exception as e:
            print(f"Error getting incident: {e}")
            return None
    
    async def get_all_incidents(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all incidents."""
        try:
            docs = self.collection.order_by('timestamp', direction=firestore.Query.DESCENDING).limit(limit).stream()
            return [doc.to_dict() for doc in docs]
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg or "Quota exceeded" in error_msg:
                print(f"⚠️  Firestore quota exceeded. Returning empty list.")
                print(f"   Solution: Wait a few minutes or upgrade Firestore plan")
            else:
                print(f"Error getting incidents: {e}")
            return []
    
    async def update_incident(self, incident_id: str, updates: Dict[str, Any]) -> bool:
        """Update incident data."""
        try:
            self.collection.document(incident_id).update(updates)
            return True
        except Exception as e:
            print(f"Error updating incident: {e}")
            return False
    
    async def delete_incident(self, incident_id: str) -> bool:
        """Delete incident by ID."""
        try:
            self.collection.document(incident_id).delete()
            return True
        except Exception as e:
            print(f"Error deleting incident: {e}")
            return False
    
    async def clear_all_incidents(self) -> int:
        """Delete all incidents. Returns count of deleted incidents."""
        try:
            deleted_count = 0
            docs = self.collection.stream()
            for doc in docs:
                doc.reference.delete()
                deleted_count += 1
            return deleted_count
        except Exception as e:
            print(f"Error clearing incidents: {e}")
            return 0
    
    async def archive_incident(self, incident_id: str) -> bool:
        """Archive incident by moving to archived collection and deleting from active."""
        try:
            # Get incident data
            incident_ref = self.collection.document(incident_id)
            incident_doc = incident_ref.get()
            
            if not incident_doc.exists:
                print(f"⚠️  Incident {incident_id} not found for archiving")
                return False
            
            incident_data = incident_doc.to_dict()
            
            # Add archive metadata
            incident_data['archived'] = True
            incident_data['archived_at'] = datetime.utcnow().isoformat()
            
            # Move to archived collection
            archived_collection = self.db.collection('archived_incidents')
            archived_collection.document(incident_id).set(incident_data)
            
            # Delete from active incidents
            incident_ref.delete()
            
            print(f"✅ Incident {incident_id} archived successfully")
            return True
        except Exception as e:
            print(f"❌ Error archiving incident: {e}")
            return False

firestore_service = FirestoreService()
