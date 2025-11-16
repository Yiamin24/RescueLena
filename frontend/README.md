# RescueLena Frontend

React-based frontend for the RescueLena disaster response platform.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **Motion** (Framer Motion) - Animations
- **MapLibre GL JS** - Interactive maps
- **Socket.IO Client** - Real-time updates
- **Lucide React** - Icons

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx          # Main dashboard with stats
│   │   ├── IncidentCard.tsx       # Individual incident display
│   │   ├── IncidentFeed.tsx       # List of incidents
│   │   ├── MapLibreMap.tsx        # Interactive map
│   │   ├── UploadZone.tsx         # File upload interface
│   │   ├── SearchAndFilter.tsx    # Search and filter controls
│   │   ├── FloatingChatbot.tsx    # AI chatbot
│   │   ├── AdvancedFeatures.tsx   # Satellite & social media
│   │   ├── SatellitePanel.tsx     # Satellite imagery
│   │   └── SocialMediaPanel.tsx   # Social media monitoring
│   ├── lib/
│   │   ├── api.ts                 # API client
│   │   ├── types.ts               # TypeScript types
│   │   └── websocket.ts           # WebSocket client
│   ├── App.tsx                    # Main application
│   ├── index.css                  # Global styles
│   └── main.tsx                   # Entry point
├── .env                           # Environment variables
├── .env.example                   # Environment template
├── package.json                   # Dependencies
├── vite.config.ts                 # Vite configuration
└── README.md                      # This file
```

## Setup

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=http://localhost:8000
```

### Development

```bash
npm run dev
```

Access at: http://localhost:5173

### Build for Production

```bash
npm run build
```

Output in `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## Key Components

### Dashboard
Main view showing:
- Statistics (total, active, resolved incidents)
- Incident feed with real-time updates
- Interactive map with incident markers
- Search and filter controls

### IncidentCard
Displays individual incident with:
- Image preview
- Type, urgency, confidence
- Location and timestamp
- Status management (Mark as Resolved)
- Verification toggle
- Auto-archive when resolved + verified

### MapLibreMap
Interactive map featuring:
- OpenStreetMap tiles
- Incident markers with color coding
- Popup on marker click
- Auto-zoom to fit all incidents

### UploadZone
File upload interface:
- Drag & drop support
- Multiple file upload
- Progress indicators
- Duplicate detection alerts
- Success/error notifications

### FloatingChatbot
AI assistant that:
- Answers questions about incidents
- Provides context-aware responses
- Uses Gemini API for natural language

## API Integration

### REST API (`lib/api.ts`)

```typescript
// Fetch all incidents
const incidents = await api.getIncidents();

// Upload image
const result = await api.analyzeImage(file);

// Update status
await api.updateStatus(id, status);

// Verify incident
await api.verifyIncident(id);
```

### WebSocket (`lib/websocket.ts`)

```typescript
// Connect to WebSocket
connectWebSocket();

// Listen for new incidents
socket.on('new_incident', (incident) => {
  // Handle new incident
});

// Listen for updates
socket.on('incident_updated', (incident) => {
  // Handle update
});
```

## Styling

Uses TailwindCSS with custom configuration:

- Dark theme with gradient backgrounds
- Glass morphism effects
- Smooth animations with Motion
- Responsive design
- Custom color palette

## Type Safety

TypeScript types defined in `lib/types.ts`:

```typescript
interface Incident {
  id: string;
  type: string;
  latitude: number;
  longitude: number;
  confidence: number;
  urgency: string;
  description: string;
  image_url: string;
  status?: string;
  verified?: boolean;
  timestamp: string;
}
```

## Features

### Real-time Updates
- WebSocket connection for live updates
- Automatic dashboard refresh
- Animated incident additions

### Duplicate Detection
- Shows alert when duplicate detected
- Displays existing incident
- Prevents duplicate creation

### Status Management
- Single "Mark as Resolved" button
- Verification toggle
- Auto-archive on resolved + verified

### Search & Filter
- Filter by incident type
- Filter by urgency level
- Filter by status
- Text search

## Performance

- Lazy loading for images
- Optimized re-renders with React.memo
- Debounced search
- Efficient WebSocket handling

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Troubleshooting

### WebSocket not connecting
- Check backend is running
- Verify VITE_WS_URL in .env
- Check browser console for errors

### Map not loading
- Check internet connection (needs OpenStreetMap tiles)
- Verify MapLibre GL JS is installed
- Check browser console for errors

### Images not displaying
- Verify Supabase configuration
- Check CORS settings
- Ensure image URLs are accessible

## Development Tips

- Use React DevTools for debugging
- Check Network tab for API calls
- Monitor WebSocket in browser DevTools
- Use TypeScript for type safety

## License

MIT License
