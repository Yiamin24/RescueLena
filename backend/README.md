# RescueLena Backend

FastAPI-based backend for AI-powered disaster response platform.

## Tech Stack

- **FastAPI** - Modern Python web framework
- **Python 3.11+** - Programming language
- **Google Gemini 2.5 Flash** - Vision AI and embeddings
- **Firebase Firestore** - NoSQL database
- **Qdrant** - Vector database for similarity search
- **Supabase** - Image storage
- **Socket.IO** - WebSocket for real-time updates
- **Uvicorn** - ASGI server

## Project Structure

```
backend/
├── routes/
│   ├── image_routes.py        # Image upload & analysis
│   ├── document_routes.py     # Document processing
│   ├── dashboard_routes.py    # Dashboard data
│   ├── status_routes.py       # Status management
│   ├── verification_routes.py # Incident verification
│   ├── batch_routes.py        # Batch operations
│   ├── satellite_routes.py    # Satellite imagery
│   └── social_routes.py       # Social media monitoring
├── services/
│   ├── gemini_service.py      # Gemini AI integration
│   ├── firestore_service.py   # Firestore operations
│   ├── qdrant_service.py      # Vector search
│   ├── storage_service.py     # Supabase storage
│   ├── brevo_service.py       # Email notifications
│   ├── satellite_service.py   # Satellite data
│   └── social_media_service.py # Social media
├── utils/
│   ├── exif_utils.py          # GPS extraction from images
│   └── format_utils.py        # Data formatting
├── config.py                  # Configuration
├── websocket_manager.py       # WebSocket handling
├── main.py                    # Application entry
└── requirements.txt           # Dependencies
```

## Setup

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Environment Variables

Create `.env` file:

```env
# Google AI
GOOGLE_API_KEY=your_gemini_api_key

# Firebase
FIREBASE_CREDENTIALS=path/to/firebase-credentials.json

# Qdrant
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_key
SUPABASE_BUCKET=rescuelena-images

# Brevo (Optional)
BREVO_API_KEY=your_brevo_key
BREVO_SENDER_EMAIL=noreply@rescuelena.com
BREVO_SENDER_NAME=RescueLena
```

### Run Development Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Access:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

## API Endpoints

### Image Analysis

**POST** `/analyze/image`
- Upload and analyze disaster image
- Returns incident data with AI classification
- Checks for duplicates
- Stores in Firestore and Qdrant

```python
# Request
files = {'file': open('disaster.jpg', 'rb')}
response = requests.post('/analyze/image', files=files)

# Response
{
  "id": "uuid",
  "type": "collapsed_building",
  "latitude": 25.2048,
  "longitude": 55.2708,
  "confidence": 0.95,
  "urgency": "high",
  "description": "Building collapse detected",
  "image_url": "https://...",
  "timestamp": "2025-11-16T10:00:00"
}
```

### Dashboard

**GET** `/dashboard`
- Returns all incidents with statistics
- Includes total, active, resolved counts

### Status Management

**PUT** `/incidents/{incident_id}/status`
- Update incident status
- Auto-archives when resolved + verified

```python
# Request
{
  "status": "resolved"
}
```

### Verification

**POST** `/incidents/{incident_id}/verify`
- Mark incident as verified
- Auto-archives if already resolved

### Batch Upload

**POST** `/analyze/batch`
- Upload multiple images
- Processes in parallel
- Returns array of results

## Services

### GeminiService (`services/gemini_service.py`)

AI-powered analysis using Google Gemini:

```python
# Analyze image
result = await gemini_service.analyze_image(image_path)
# Returns: type, confidence, description, people_affected

# Generate embedding
embedding = await gemini_service.generate_embedding(text)
# Returns: 768-dimensional vector

# Chat response
response = await gemini_service.chat_response(message, context)
# Returns: AI-generated response
```

### FirestoreService (`services/firestore_service.py`)

Database operations:

```python
# Store incident
incident_id = await firestore_service.store_incident(data)

# Get all incidents
incidents = await firestore_service.get_all_incidents()

# Update status
await firestore_service.update_status(incident_id, status)

# Archive incident
await firestore_service.archive_incident(incident_id)
```

### QdrantService (`services/qdrant_service.py`)

Vector search for similarity:

```python
# Store embedding
await qdrant_service.store_embedding(id, embedding, metadata)

# Search similar
results = await qdrant_service.search_similar(embedding, limit=5)
```

### StorageService (`services/storage_service.py`)

Image storage:

```python
# Upload image
url = await storage_service.upload_image(file_path)
# Returns: Public URL
```

## Key Features

### Duplicate Detection

Prevents duplicate incidents:
1. Checks same incident type
2. Calculates distance between locations
3. If within 100m, returns existing incident
4. Otherwise creates new incident

```python
# In image_routes.py
for existing in existing_incidents:
    if existing['type'] == analysis['type']:
        distance = calculate_distance(lat, lng, existing_lat, existing_lng)
        if distance < 100:  # 100 meters
            return {"duplicate": True, "existing_incident": existing}
```

### Auto-Archive

Automatically archives resolved incidents:
1. Status updated to "resolved"
2. Incident marked as verified
3. Triggers auto-archive
4. Moves to archived collection

```python
# In status_routes.py
if status == "resolved" and incident.get("verified"):
    await firestore_service.archive_incident(incident_id)
```

### Real-time Updates

WebSocket broadcasts:
- New incidents
- Status updates
- Verification changes

```python
# In websocket_manager.py
await broadcast_new_incident(incident_data)
await broadcast_incident_update(incident_id, update_data)
```

## Utilities

### EXIF Utils (`utils/exif_utils.py`)

Extract GPS coordinates from images:

```python
from utils.exif_utils import get_gps_coordinates

coords = get_gps_coordinates(image_path)
# Returns: (latitude, longitude) or None
```

### Format Utils (`utils/format_utils.py`)

Data formatting helpers:

```python
from utils.format_utils import determine_urgency, format_incident_response

urgency = determine_urgency(confidence, incident_type, people_affected)
response = format_incident_response(incident_data)
```

## Error Handling

All endpoints include:
- Try-catch blocks
- Timeout handling (3-5 seconds)
- Fallback mechanisms
- Detailed logging

```python
try:
    result = await asyncio.wait_for(
        gemini_service.analyze_image(path),
        timeout=5.0
    )
except asyncio.TimeoutError:
    # Fallback logic
    result = default_analysis()
```

## Logging

Comprehensive logging with emojis:
- 📤 Upload received
- 🤖 AI analysis
- ✅ Success
- ⚠️ Warnings
- ❌ Errors

## Testing

Run backend tests:

```bash
python test_backend.py
```

## Performance

- Async/await for concurrent operations
- Timeout handling for external APIs
- Connection pooling for databases
- Efficient vector search with Qdrant

## Security

- CORS enabled for frontend
- API key validation
- File type validation
- Size limits on uploads

## Deployment

### Production Server

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Docker (Optional)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Troubleshooting

### Gemini API errors
- Check API key is valid
- Verify quota limits
- Check internet connection

### Firestore connection issues
- Verify credentials file path
- Check Firebase project settings
- Ensure Firestore is enabled

### Qdrant errors
- Verify cluster URL and API key
- Check collection exists
- Ensure vector dimensions match (768)

### Supabase upload fails
- Check bucket exists
- Verify storage permissions
- Check file size limits

## License

MIT License
