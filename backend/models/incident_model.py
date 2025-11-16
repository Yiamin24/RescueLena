from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class IncidentBase(BaseModel):
    type: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    confidence: float
    urgency: str
    description: str
    people_affected: Optional[int] = None
    location_text: Optional[str] = None

class IncidentCreate(IncidentBase):
    image_url: Optional[str] = None
    embedding: List[float]

class Incident(IncidentBase):
    id: str
    image_url: Optional[str] = None
    timestamp: str
    
    class Config:
        from_attributes = True

class ImageAnalysisRequest(BaseModel):
    pass  # File will be uploaded

class TextAnalysisRequest(BaseModel):
    text: str

class QueryRequest(BaseModel):
    query: str
    limit: int = 10

class ChatRequest(BaseModel):
    message: str
