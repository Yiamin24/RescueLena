from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from config import config
from typing import List, Dict, Any
import uuid

class QdrantService:
    def __init__(self):
        self.client = QdrantClient(
            url=config.QDRANT_URL,
            api_key=config.QDRANT_API_KEY
        )
        self.collection_name = config.QDRANT_COLLECTION
        self._ensure_collection()
    
    def _ensure_collection(self):
        """Create collection if it doesn't exist."""
        try:
            collections = self.client.get_collections().collections
            exists = any(c.name == self.collection_name for c in collections)
            
            if not exists:
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=config.EMBEDDING_DIM,
                        distance=Distance.COSINE
                    )
                )
                print(f"Created Qdrant collection: {self.collection_name}")
        except Exception as e:
            print(f"Error ensuring collection: {e}")
    
    async def store_embedding(self, incident_id: str, embedding: List[float], metadata: Dict[str, Any]):
        """Store incident embedding in Qdrant."""
        try:
            point = PointStruct(
                id=incident_id,
                vector=embedding,
                payload=metadata
            )
            
            self.client.upsert(
                collection_name=self.collection_name,
                points=[point]
            )
            return True
        except Exception as e:
            print(f"Error storing embedding: {e}")
            return False
    
    async def search_similar(self, query_embedding: List[float], limit: int = 10) -> List[Dict[str, Any]]:
        """Search for similar incidents."""
        try:
            results = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_embedding,
                limit=limit
            )
            
            return [
                {
                    "id": str(result.id),
                    "score": result.score,
                    **result.payload
                }
                for result in results
            ]
        except Exception as e:
            print(f"Error searching: {e}")
            return []
    
    async def delete_point(self, incident_id: str) -> bool:
        """Delete a point from Qdrant."""
        try:
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=[incident_id]
            )
            return True
        except Exception as e:
            print(f"Error deleting point: {e}")
            return False
    
    async def clear_collection(self) -> bool:
        """Clear all points from the collection."""
        try:
            # Delete and recreate collection
            self.client.delete_collection(collection_name=self.collection_name)
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(
                    size=config.EMBEDDING_DIM,
                    distance=Distance.COSINE
                )
            )
            print(f"Cleared and recreated Qdrant collection: {self.collection_name}")
            return True
        except Exception as e:
            print(f"Error clearing collection: {e}")
            return False

qdrant_service = QdrantService()
