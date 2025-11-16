from fastapi import APIRouter, HTTPException
from models.incident_model import QueryRequest
from services.gemini_service import gemini_service
from services.qdrant_service import qdrant_service

router = APIRouter()

@router.post("/query")
async def query_incidents(request: QueryRequest):
    """Search for similar incidents using natural language."""
    try:
        # Generate embedding for query
        query_embedding = await gemini_service.generate_embedding(request.query)
        
        # Search in Qdrant
        results = await qdrant_service.search_similar(query_embedding, limit=request.limit)
        
        return {
            "query": request.query,
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        print(f"Error in query: {e}")
        raise HTTPException(status_code=500, detail=str(e))
