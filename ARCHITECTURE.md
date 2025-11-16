# RescueLena Architecture

System architecture and design documentation for the RescueLena disaster response platform.

## System Overview

RescueLena is a full-stack AI-powered disaster response platform that processes images and documents to detect, classify, and manage emergency incidents in real-time.

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  React + TypeScript + TailwindCSS + MapLibre + Socket.IO    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP/WebSocket
                         │
┌────────────────────────▼────────────────────────────────────┐
│                      Backend API                             │
│              FastAPI + Python + Socket.IO                    │
└─────┬──────────┬──────────┬──────────┬──────────┬──────────┘
      │          │          │          │          │
      │          │          │          │          │
┌─────▼──┐  ┌───▼────┐  ┌──▼─────┐  ┌─▼──────┐  ┌▼────────┐
│ Gemini │  │Firebase│  │ Qdrant │  │Supabase│  │  Brevo  │
│   AI   │  │Firestore│  │ Vector │  │Storage │  │  Email  │
└────────┘  └────────┘  └────────┘  └────────┘  └─────────┘
```

## Architecture Layers

### 1. Presentation Layer (Frontend)

**Technology:** React 18 + TypeScript + Vite

**Components:**
- `Dashboard` - Main view with statistics and controls
- `IncidentFeed` - List of incidents with real-time updates
- `IncidentCard` - Individual incident display and management
- `MapLibreMap` - Interactive map with incident markers
- `UploadZone` - File upload interface with drag & drop
- `SearchAndFilter` - Search and filter controls
- `FloatingChatbot` - AI assistant for queries
- `AdvancedFeatures` - Satellite and social media panels

**State Management:**
- React hooks (useState, useEffect, useCallback)
- WebSocket for real-time state synchronization
- Custom events for cross-component communication

**Styling:**
- TailwindCSS for utility-first styling
- Motion (Framer Motion) for animations
- Custom gradient themes and glass morphism

### 2. API Layer (Backend)

**Technology:** FastAPI + Python 3.11

**Routes:**
```
/analyze/image          - Image upload and analysis
/analyze/document       - Document processing
/analyze/batch          - Batch upload
/dashboard              - Dashboard data
/incidents/{id}/status  - Status management
/incidents/{id}/verify  - Verification
/health                 - Health check
```

**Middleware:**
- CORS for cross-origin requests
- Socket.IO for WebSocket connections
- Error handling and logging

### 3. Business Logic Layer (Services)

#### GeminiService
- **Purpose:** AI-powered image and text analysis
- **Model:** Gemini 2.5 Flash
- **Functions:**
  - `analyze_image()` - Detect disaster type from images
  - `generate_embedding()` - Create 768-dim vectors
  - `chat_response()` - AI chatbot responses
  - `analyze_text()` - Extract info from text

#### FirestoreService
- **Purpose:** Primary database operations
- **Collections:**
  - `incidents` - Active incidents
  - `archived_incidents` - Resolved incidents
- **Functions:**
  - `store_incident()` - Create new incident
  - `get_all_incidents()` - Fetch all incidents
  - `update_status()` - Update incident status
  - `archive_incident()` - Move to archive
  - `verify_incident()` - Mark as verified

#### QdrantService
- **Purpose:** Vector similarity search
- **Collection:** `rescuelena`
- **Vector Dimension:** 768
- **Functions:**
  - `store_embedding()` - Store incident vector
  - `search_similar()` - Find similar incidents
  - `clear_collection()` - Reset database

#### StorageService
- **Purpose:** Image storage and retrieval
- **Provider:** Supabase Storage
- **Bucket:** `rescuelena-images`
- **Functions:**
  - `upload_image()` - Upload and get public URL
  - Automatic file naming with UUIDs

#### BrevoService
- **Purpose:** Email notifications (optional)
- **Functions:**
  - `send_notification()` - Send email alerts
  - Template-based emails

### 4. Data Layer

#### Firebase Firestore
**Structure:**
```
incidents/
  {incident_id}/
    - id: string
    - type: string
    - latitude: number
    - longitude: number
    - confidence: number
    - urgency: string
    - description: string
    - image_url: string
    - status: string
    - verified: boolean
    - timestamp: datetime
    - people_affected: number

archived_incidents/
  {incident_id}/
    - (same structure as incidents)
```

#### Qdrant Vector Database
**Structure:**
```
Collection: rescuelena
  Point:
    - id: incident_id
    - vector: [768 dimensions]
    - payload:
        - type: string
        - description: string
        - location: string
```

#### Supabase Storage
**Structure:**
```
Bucket: rescuelena-images
  incidents/
    {uuid}.jpg
    {uuid}.jpg
    ...
```

## Data Flow

### 1. Image Upload Flow

```
User uploads image
    ↓
Frontend: UploadZone component
    ↓
POST /analyze/image
    ↓
Backend: Extract GPS from EXIF
    ↓
Gemini: Analyze image → type, confidence, description
    ↓
Supabase: Upload image → get URL
    ↓
Gemini: Generate embedding vector
    ↓
Check for duplicates (same type + within 100m)
    ↓
    ├─ Duplicate found → Return existing incident
    │
    └─ No duplicate:
        ↓
        Firestore: Store incident data
        ↓
        Qdrant: Store embedding vector
        ↓
        WebSocket: Broadcast new_incident event
        ↓
        Frontend: Update dashboard in real-time
```

### 2. Status Update Flow

```
User clicks "Mark as Resolved"
    ↓
PUT /incidents/{id}/status
    ↓
Firestore: Update status field
    ↓
Check if verified = true
    ↓
    └─ If yes:
        ↓
        Firestore: Move to archived_incidents
        ↓
        Firestore: Delete from incidents
        ↓
        WebSocket: Broadcast incident_updated event
        ↓
        Frontend: Remove from active list
```

### 3. Real-time Update Flow

```
Backend: New incident created
    ↓
WebSocket: Emit "new_incident" event
    ↓
All connected clients receive event
    ↓
Frontend: Update state
    ↓
Dashboard: Re-render with new incident
    ↓
Map: Add new marker
    ↓
Feed: Add to top of list with animation
```

## Key Design Patterns

### 1. Service Layer Pattern
- Separation of concerns
- Each service handles one external system
- Reusable across routes

### 2. Repository Pattern
- Firestore and Qdrant services abstract database operations
- Easy to swap implementations

### 3. Observer Pattern
- WebSocket for real-time updates
- Event-driven architecture
- Decoupled components

### 4. Strategy Pattern
- Different analysis strategies (image, document, text)
- Pluggable AI models

## Security Architecture

### Authentication & Authorization
- Currently open (hackathon version)
- Ready for JWT/OAuth integration
- API key validation for external services

### Data Security
- Environment variables for secrets
- HTTPS for production
- CORS configuration
- File type validation
- Size limits on uploads

### API Security
- Rate limiting (can be added)
- Input validation
- Error message sanitization

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- WebSocket with Redis adapter (future)
- Load balancer ready

### Database Scaling
- Firestore auto-scales
- Qdrant cloud handles scaling
- Supabase CDN for images

### Performance Optimization
- Async/await for concurrent operations
- Timeout handling (3-5 seconds)
- Connection pooling
- Lazy loading in frontend
- Debounced search

## Monitoring & Logging

### Backend Logging
```python
print(f"📤 Received image upload: {filename}")
print(f"🤖 Analyzing with Gemini...")
print(f"✅ Analysis complete: {type}")
print(f"⚠️  Duplicate found!")
print(f"❌ Error: {error}")
```

### Error Handling
- Try-catch blocks at all levels
- Fallback mechanisms
- Graceful degradation
- User-friendly error messages

## Deployment Architecture

### Development
```
Local Machine
├── Backend: localhost:8000
└── Frontend: localhost:5173
```

### Production (Recommended)
```
Cloud Provider (AWS/GCP/Azure)
├── Backend: API Server (Docker/VM)
│   └── Uvicorn with multiple workers
├── Frontend: Static hosting (Vercel/Netlify)
│   └── CDN distribution
└── External Services:
    ├── Firebase (managed)
    ├── Qdrant Cloud (managed)
    ├── Supabase (managed)
    └── Google AI (managed)
```

## Technology Choices

### Why FastAPI?
- Modern async Python framework
- Automatic API documentation
- Type hints and validation
- WebSocket support
- High performance

### Why React?
- Component-based architecture
- Large ecosystem
- TypeScript support
- Excellent developer experience

### Why Gemini 2.5 Flash?
- Vision and text capabilities
- Fast response times
- High accuracy
- Embedding generation
- Cost-effective

### Why Firestore?
- Real-time capabilities
- Scalable NoSQL
- Easy to use
- Good free tier
- Managed service

### Why Qdrant?
- Purpose-built for vectors
- Fast similarity search
- Cloud-hosted option
- Good documentation
- Python SDK

### Why Supabase?
- Open-source alternative to Firebase Storage
- Easy integration
- CDN included
- Good free tier

## Future Enhancements

### Short-term
- User authentication
- Role-based access control
- Email notifications
- SMS alerts
- Export functionality

### Medium-term
- Mobile app (React Native)
- Offline support
- Advanced analytics
- Machine learning improvements
- Multi-language support

### Long-term
- Drone integration
- IoT sensor data
- Predictive analytics
- Government API integration
- Blockchain for audit trail

## System Requirements

### Development
- Python 3.11+
- Node.js 18+
- 4GB RAM minimum
- Internet connection

### Production
- 2+ CPU cores
- 4GB+ RAM
- 20GB+ storage
- High-speed internet
- SSL certificate

## Conclusion

RescueLena's architecture is designed for:
- **Scalability** - Handle growing data and users
- **Reliability** - Graceful error handling
- **Maintainability** - Clean separation of concerns
- **Extensibility** - Easy to add new features
- **Performance** - Fast response times
- **Real-time** - Live updates via WebSocket

The modular design allows each component to be developed, tested, and deployed independently while maintaining a cohesive system.
