# RescueLena 🚨

AI-powered disaster response platform that analyzes images and documents to detect, classify, and manage emergency incidents in real-time.

## Features

- **AI Image Analysis** - Gemini Vision API detects disaster types from uploaded images
- **Duplicate Detection** - Prevents duplicate incidents using location-based proximity checks
- **Real-time Updates** - WebSocket integration for live incident notifications
- **Interactive Map** - MapLibre GL JS with OpenStreetMap tiles
- **Status Management** - Track incident resolution and verification
- **Auto-Archive** - Automatically archives resolved and verified incidents
- **Batch Upload** - Process multiple images simultaneously
- **Smart Search** - Filter incidents by type, urgency, and status

## Tech Stack

**Frontend:**
- React 18 + TypeScript + Vite
- TailwindCSS + Motion (Framer Motion)
- MapLibre GL JS
- Socket.IO Client

**Backend:**
- FastAPI + Python 3.11
- Google Gemini 2.5 Flash (Vision & Embeddings)
- Firebase Firestore (Database)
- Qdrant (Vector Search)
- Supabase (Image Storage)
- Socket.IO (WebSocket)

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Firebase account
- Google AI API key
- Qdrant Cloud account
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd RescueLena
```

2. **Install dependencies**
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

3. **Configure environment variables**

Create `backend/.env`:
```env
GOOGLE_API_KEY=your_gemini_api_key
FIREBASE_CREDENTIALS=path/to/firebase-credentials.json
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=http://localhost:8000
```

4. **Run the application**

```bash
# Terminal 1 - Backend
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Project Structure

```
RescueLena/
├── backend/              # FastAPI backend
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   └── main.py          # Application entry
├── frontend/            # React frontend
│   └── src/
│       ├── components/  # UI components
│       ├── lib/         # API & utilities
│       └── App.tsx      # Main app
├── clear_database.py    # Database cleanup utility
└── README.md           # This file
```

## Documentation

- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)
- [Architecture](./ARCHITECTURE.md)
- [How It Works](./WORKING.md)

## Key Features Explained

### Duplicate Detection
Prevents duplicate incidents by checking:
- Same incident type
- Within 100m radius
- Returns existing incident instead of creating new

### Auto-Archive
Automatically archives incidents when:
- Status is set to "resolved"
- AND incident is verified
- Moves to archived collection in Firestore

### Real-time Updates
- WebSocket broadcasts new incidents to all connected clients
- Dashboard updates automatically without refresh
- Live incident feed with animations

## Database Management

Clear all incidents:
```bash
python clear_database.py
```

## License

MIT License

## Support

For issues or questions, please open an issue on GitHub.
