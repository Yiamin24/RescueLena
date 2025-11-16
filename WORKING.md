# How RescueLena Works

Detailed explanation of how RescueLena processes disaster incidents from upload to resolution.

## Overview

RescueLena uses AI to automatically detect, classify, and manage disaster incidents from uploaded images. The system prevents duplicates, provides real-time updates, and automatically archives resolved incidents.

## Core Workflows

### 1. Image Upload & Analysis

**Step-by-step process:**

1. **User uploads image**
   - Drag & drop or file selection
   - Supports JPG, PNG formats
   - Multiple files supported

2. **Frontend validation**
   - Check file type
   - Check file size
   - Create preview
   - Show upload progress

3. **Backend receives image**
   ```python
   POST /analyze/image
   Content-Type: multipart/form-data
   ```

4. **Extract GPS coordinates**
   - Read EXIF data from image
   - Extract latitude/longitude
   - If no GPS: use default coordinates (25.2048, 55.2708)

5. **AI Analysis with Gemini**
   ```python
   # Send image to Gemini Vision API
   result = await gemini_service.analyze_image(image_path)
   
   # Returns:
   {
     "type": "collapsed_building",
     "confidence": 0.95,
     "description": "Multiple buildings collapsed...",
     "people_affected": 0
   }
   ```

6. **Determine urgency**
   ```python
   if confidence > 0.8 and type in ['fire', 'collapsed_building']:
       urgency = "high"
   elif confidence > 0.6:
       urgency = "medium"
   else:
       urgency = "low"
   ```

7. **Upload to Supabase**
   - Generate unique filename (UUID)
   - Upload to `rescuelena-images` bucket
   - Get public URL

8. **Generate embedding vector**
   ```python
   # Create text representation
   text = f"{type} {description}"
   
   # Generate 768-dimensional vector
   embedding = await gemini_service.generate_embedding(text)
   ```

9. **Check for duplicates**
   ```python
   # Get all existing incidents
   existing = await firestore_service.get_all_incidents()
   
   # For each incident of same type
   for incident in existing:
       if incident['type'] == new_type:
           # Calculate distance
           distance = calculate_distance(
               new_lat, new_lng,
               incident_lat, incident_lng
           )
           
           # If within 100 meters
           if distance < 100:
               return {
                   "duplicate": True,
                   "existing_incident": incident,
                   "distance_meters": distance
               }
   ```

10. **Store in databases**
    ```python
    # Firestore: Store incident data
    incident_id = await firestore_service.store_incident({
        "type": type,
        "latitude": lat,
        "longitude": lng,
        "confidence": confidence,
        "urgency": urgency,
        "description": description,
        "image_url": image_url,
        "status": "active",
        "verified": False,
        "timestamp": datetime.now()
    })
    
    # Qdrant: Store embedding vector
    await qdrant_service.store_embedding(
        incident_id,
        embedding,
        metadata
    )
    ```

11. **Broadcast to clients**
    ```python
    # Send WebSocket event to all connected clients
    await broadcast_new_incident({
        "id": incident_id,
        "type": type,
        "latitude": lat,
        "longitude": lng,
        ...
    })
    ```

12. **Frontend updates**
    - Receive WebSocket event
    - Add to incident list
    - Update map markers
    - Update statistics
    - Show animation

### 2. Duplicate Detection

**How it works:**

1. **Location-based check**
   ```python
   # Calculate distance using Haversine formula
   lat_diff = abs(lat1 - lat2)
   lng_diff = abs(lng1 - lng2)
   distance = sqrt(lat_diff² + lng_diff²) * 111000  # Convert to meters
   ```

2. **Type matching**
   - Only compare incidents of same type
   - e.g., "fire" only matches with "fire"

3. **Proximity threshold**
   - 100 meters radius
   - Configurable in code

4. **Response handling**
   ```javascript
   if (result.duplicate) {
       alert(`⚠️ Duplicate Incident!
       
       A similar ${result.existing_incident.type} 
       already exists ${result.distance_meters}m away.
       
       Showing existing incident instead.`);
       
       // Don't create new incident
       // Show existing one on map
   }
   ```

### 3. Status Management

**Status lifecycle:**

```
active → resolved → archived
  ↓         ↓
verified  verified
```

**Process:**

1. **User marks as resolved**
   ```javascript
   // Frontend
   await api.updateStatus(incident_id, "resolved");
   ```

2. **Backend updates status**
   ```python
   # Update in Firestore
   await firestore_service.update_status(incident_id, "resolved")
   ```

3. **Check for auto-archive**
   ```python
   # Get incident data
   incident = await firestore_service.get_incident(incident_id)
   
   # If both resolved AND verified
   if status == "resolved" and incident.get("verified") == True:
       # Move to archive
       await firestore_service.archive_incident(incident_id)
   ```

4. **Archive process**
   ```python
   # Copy to archived_incidents collection
   await db.collection('archived_incidents').document(id).set(data)
   
   # Delete from incidents collection
   await db.collection('incidents').document(id).delete()
   
   # Broadcast update
   await broadcast_incident_update(id, {"archived": True})
   ```

### 4. Verification

**Process:**

1. **User toggles verification**
   ```javascript
   await api.verifyIncident(incident_id);
   ```

2. **Backend updates**
   ```python
   # Update verified field
   await firestore_service.verify_incident(incident_id)
   ```

3. **Check for auto-archive**
   ```python
   # If already resolved
   if incident.get("status") == "resolved":
       # Archive immediately
       await firestore_service.archive_incident(incident_id)
   ```

### 5. Real-time Updates

**WebSocket flow:**

1. **Client connects**
   ```javascript
   const socket = io('http://localhost:8000');
   
   socket.on('connection_established', (data) => {
       console.log('Connected:', data.sid);
   });
   ```

2. **Server broadcasts events**
   ```python
   # New incident
   await sio.emit('new_incident', incident_data)
   
   # Status update
   await sio.emit('incident_updated', {
       'id': incident_id,
       'status': new_status
   })
   ```

3. **Client receives and updates**
   ```javascript
   socket.on('new_incident', (incident) => {
       setIncidents(prev => [incident, ...prev]);
       updateMap(incident);
       updateStats();
   });
   
   socket.on('incident_updated', (data) => {
       setIncidents(prev => 
           prev.map(inc => 
               inc.id === data.id 
                   ? {...inc, ...data} 
                   : inc
           )
       );
   });
   ```

### 6. Search & Filter

**How filtering works:**

1. **User selects filters**
   - Incident type (fire, flood, etc.)
   - Urgency level (high, medium, low)
   - Status (active, resolved)

2. **Frontend filters locally**
   ```javascript
   const filtered = incidents.filter(incident => {
       // Type filter
       if (typeFilter && incident.type !== typeFilter) {
           return false;
       }
       
       // Urgency filter
       if (urgencyFilter && incident.urgency !== urgencyFilter) {
           return false;
       }
       
       // Status filter
       if (statusFilter && incident.status !== statusFilter) {
           return false;
       }
       
       // Text search
       if (searchText) {
           const searchLower = searchText.toLowerCase();
           return (
               incident.type.toLowerCase().includes(searchLower) ||
               incident.description.toLowerCase().includes(searchLower) ||
               incident.location.toLowerCase().includes(searchLower)
           );
       }
       
       return true;
   });
   ```

3. **Update display**
   - Filter incident list
   - Update map markers
   - Update statistics

### 7. Map Visualization

**How the map works:**

1. **Initialize MapLibre**
   ```javascript
   const map = new maplibregl.Map({
       container: 'map',
       style: 'https://tiles.openstreetmap.org/...',
       center: [55.2708, 25.2048], // Dubai
       zoom: 11
   });
   ```

2. **Add incident markers**
   ```javascript
   incidents.forEach(incident => {
       // Color based on urgency
       const color = 
           incident.urgency === 'high' ? '#ef4444' :
           incident.urgency === 'medium' ? '#f59e0b' :
           '#10b981';
       
       // Create marker
       new maplibregl.Marker({ color })
           .setLngLat([incident.longitude, incident.latitude])
           .setPopup(new maplibregl.Popup().setHTML(`
               <h3>${incident.type}</h3>
               <p>${incident.description}</p>
           `))
           .addTo(map);
   });
   ```

3. **Auto-fit bounds**
   ```javascript
   // Calculate bounds to fit all markers
   const bounds = new maplibregl.LngLatBounds();
   incidents.forEach(inc => {
       bounds.extend([inc.longitude, inc.latitude]);
   });
   map.fitBounds(bounds, { padding: 50 });
   ```

### 8. Chatbot

**How the AI chatbot works:**

1. **User asks question**
   ```javascript
   const response = await api.chat(message);
   ```

2. **Backend prepares context**
   ```python
   # Get recent incidents
   incidents = await firestore_service.get_all_incidents(limit=10)
   
   # Format as context
   context = "\n".join([
       f"- {inc['type']} at {inc['location']}, "
       f"urgency: {inc['urgency']}, "
       f"status: {inc['status']}"
       for inc in incidents
   ])
   ```

3. **Send to Gemini**
   ```python
   prompt = f"""You are RescueLena, an AI disaster response assistant.

   Context (current incidents):
   {context}

   User question: {message}

   Provide a helpful, concise response about the disaster situation."""
   
   response = await gemini_service.chat_response(prompt)
   ```

4. **Return to user**
   - Display in chat interface
   - Maintain conversation history

## Technical Details

### Distance Calculation

```python
def calculate_distance(lat1, lng1, lat2, lng2):
    """
    Calculate distance between two points in meters.
    Uses simplified Euclidean distance (good for small distances).
    """
    lat_diff = abs(lat1 - lat2)
    lng_diff = abs(lng1 - lng2)
    
    # Convert degrees to meters (approximate)
    # 1 degree ≈ 111km at equator
    distance = ((lat_diff ** 2 + lng_diff ** 2) ** 0.5) * 111000
    
    return distance
```

### Urgency Determination

```python
def determine_urgency(confidence, incident_type, people_affected):
    """
    Determine urgency level based on multiple factors.
    """
    # High urgency types
    high_urgency_types = [
        'fire',
        'collapsed_building',
        'people_in_danger',
        'medical_emergency'
    ]
    
    # Check conditions
    if incident_type in high_urgency_types and confidence > 0.8:
        return "high"
    
    if people_affected > 10:
        return "high"
    
    if confidence > 0.6:
        return "medium"
    
    return "low"
```

### Embedding Generation

```python
async def generate_embedding(text):
    """
    Generate 768-dimensional embedding vector.
    Used for similarity search.
    """
    result = genai.embed_content(
        model="models/text-embedding-004",
        content=text,
        task_type="retrieval_document"
    )
    
    return result['embedding']  # List of 768 floats
```

## Performance Optimizations

### 1. Timeout Handling
```python
# All external API calls have timeouts
try:
    result = await asyncio.wait_for(
        gemini_service.analyze_image(path),
        timeout=5.0
    )
except asyncio.TimeoutError:
    # Use fallback
    result = default_analysis()
```

### 2. Concurrent Operations
```python
# Upload and embedding generation in parallel
await asyncio.gather(
    storage_service.upload_image(path),
    gemini_service.generate_embedding(text)
)
```

### 3. Lazy Loading
```javascript
// Images load on demand
<img 
    src={incident.image_url} 
    loading="lazy"
    alt={incident.type}
/>
```

### 4. Debounced Search
```javascript
// Wait 300ms after user stops typing
const debouncedSearch = debounce((query) => {
    filterIncidents(query);
}, 300);
```

## Error Handling

### Backend
```python
try:
    # Main operation
    result = await process_image(file)
except asyncio.TimeoutError:
    # Timeout fallback
    result = default_result()
except Exception as e:
    # Log and return error
    print(f"❌ Error: {e}")
    raise HTTPException(status_code=500, detail=str(e))
```

### Frontend
```javascript
try {
    const result = await api.analyzeImage(file);
    showSuccess(result);
} catch (error) {
    showError(error.message);
}
```

## Data Consistency

### Firestore + Qdrant Sync
```python
# Always update both databases
try:
    # Store in Firestore
    incident_id = await firestore_service.store_incident(data)
    
    # Store in Qdrant
    await qdrant_service.store_embedding(incident_id, embedding, data)
except Exception as e:
    # Rollback if either fails
    await cleanup(incident_id)
    raise
```

## Conclusion

RescueLena's workflow is designed to be:
- **Fast** - AI analysis in 2-5 seconds
- **Accurate** - High confidence detection
- **Reliable** - Fallback mechanisms
- **Real-time** - Instant updates via WebSocket
- **Smart** - Duplicate prevention
- **Automated** - Auto-archive resolved incidents

The system handles the entire incident lifecycle from detection to resolution with minimal manual intervention.
