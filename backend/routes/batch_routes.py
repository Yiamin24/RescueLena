from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
from services.gemini_service import gemini_service
from services.qdrant_service import qdrant_service
from services.firestore_service import firestore_service
from services.storage_service import storage_service
from utils.exif_utils import get_gps_coordinates
from utils.format_utils import determine_urgency, format_incident_response
from websocket_manager import broadcast_new_incident
import tempfile
import os
import asyncio

router = APIRouter()

@router.post("/batch/upload")
async def analyze_batch(files: List[UploadFile] = File(...)):
    """Analyze multiple images in batch."""
    if len(files) > 100:
        raise HTTPException(status_code=400, detail="Maximum 100 files per batch")
    
    results = []
    successful = 0
    failed = 0
    
    for file in files:
        try:
            # Save temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_file:
                content = await file.read()
                tmp_file.write(content)
                tmp_path = tmp_file.name
            
            # Extract GPS
            gps_coords = get_gps_coordinates(tmp_path)
            if gps_coords:
                lat, lng = gps_coords
            else:
                import random
                lat = 25.2048 + random.uniform(-0.1, 0.1)
                lng = 55.2708 + random.uniform(-0.1, 0.1)
            
            # Analyze
            analysis = await gemini_service.analyze_image(tmp_path)
            image_url = await storage_service.upload_image(tmp_path)
            urgency = determine_urgency(
                analysis['confidence'],
                analysis['type'],
                analysis.get('people_affected', 0)
            )
            
            # Generate embedding
            embedding_text = f"{analysis['type']} {analysis['description']}"
            embedding = await gemini_service.generate_embedding(embedding_text)
            
            # Store
            incident_data = {
                "type": analysis['type'],
                "lat": lat,
                "lng": lng,
                "confidence": analysis['confidence'],
                "urgency": urgency,
                "description": analysis['description'],
                "people_affected": analysis.get('people_affected', 0),
                "image_url": image_url,
                "location_text": None,
                "status": "new"
            }
            
            incident_id = await firestore_service.store_incident(incident_data)
            await qdrant_service.store_embedding(incident_id, embedding, incident_data)
            
            # Cleanup
            os.unlink(tmp_path)
            
            # Format response
            incident_data['id'] = incident_id
            response = format_incident_response(incident_data)
            
            # Broadcast
            await broadcast_new_incident(response)
            
            results.append({
                "filename": file.filename,
                "success": True,
                "incident": response
            })
            successful += 1
            
        except Exception as e:
            results.append({
                "filename": file.filename,
                "success": False,
                "error": str(e)
            })
            failed += 1
    
    return {
        "total": len(files),
        "successful": successful,
        "failed": failed,
        "results": results
    }
