# 🚨 RescueLena - AI-Powered Disaster Response System

A modern, professional React + TypeScript frontend for real-time disaster response and emergency management.

## ✨ Features Implemented

### 📱 Pages
- **Landing Page**: Hero section with animated gradients, feature showcase, stats, and CTAs
- **Dashboard**: Real-time incident monitoring with interactive map and feed
- **Advanced Features**: Social media monitoring and satellite analysis
- **About Page**: Mission, vision, technology stack, and contact information

### 🎯 Core Components

#### Dashboard
- **Stats Panel**: Real-time metrics (total incidents, high urgency, active responders, response time)
- **Search & Filter**: Full-text search with filters for type, urgency, and verification status
- **Interactive Map**: Visual incident mapping with color-coded urgency markers
  - Red markers: High urgency
  - Orange markers: Medium urgency
  - Green markers: Low urgency
  - Green border + ✓: Verified incidents
  - White border + ⚠: Unverified incidents
- **Incident Feed**: Scrollable list of incidents with detailed cards
- **Upload Zone**: Drag-and-drop file upload (images, PDFs, documents)
- **Floating Chatbot**: AI assistant for emergency coordination

#### Advanced Features
- **Social Media Monitor**: Analyze disaster-related posts from Twitter/X
- **Satellite Analysis**: Analyze areas using coordinates and radius
  - Fire detection
  - Flood monitoring
  - Building damage assessment
- Real-time analysis results with confidence scores

### 🎨 Design System

#### Color Palette
- **Emergency Theme**: Red (#FF3B30) to Orange (#FF6B00)
- **Advanced Features**: Purple (#9333EA) to Pink (#EC4899)
- **Status Colors**:
  - High urgency: Red
  - Medium urgency: Orange
  - Low urgency: Green
  - Verified: Green
  - Unverified: Orange

#### Visual Effects
- Glassmorphism (backdrop-blur, transparency)
- Smooth animations (Motion/Framer Motion)
- Gradient backgrounds
- Pulse effects for live data
- Hover effects and transitions
- Staggered list animations

### 🔧 Technical Implementation

#### TypeScript Interfaces
```typescript
- Incident: Full incident data structure
- DashboardStats: Dashboard metrics
- ChatMessage: AI chatbot messages
- SocialMediaAnalysis: Social media analysis results
- SatelliteAnalysis: Satellite imagery analysis results
```

#### API Integration (Mock)
All API calls are implemented with mock data and delays to simulate real backend:
- GET /dashboard - Dashboard data
- POST /analyze/image - Image analysis
- POST /analyze/text - Text analysis
- POST /query - Semantic search
- POST /chat - AI chatbot
- POST /social/analyze - Social media analysis
- POST /satellite/analyze - Satellite analysis

#### State Management
- React useState for local state
- Real-time incident updates
- Filter and search state persistence
- Selected incident tracking

### 🎬 Animations
- Page transitions (fade, slide)
- Card hover effects (scale, shadow)
- Loading spinners
- Progress bars
- Pulse effects
- Stagger animations for lists
- Smooth scrolling

### 📱 Responsive Design
- Mobile-first approach
- Breakpoints:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
- Stacked layout on mobile
- Full two-column layout on desktop
- Touch-friendly buttons

### ♿ Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- Semantic HTML
- Screen reader friendly

## 🚀 What's Ready

✅ Complete page structure
✅ All major components
✅ Interactive map with markers
✅ Incident filtering and search
✅ File upload with progress
✅ AI chatbot interface
✅ Social media analysis panel
✅ Satellite analysis panel
✅ Mock API integration
✅ Responsive design
✅ Dark mode theme
✅ Smooth animations
✅ Professional UI/UX

## 🔌 Backend Integration

To connect to your real backend (http://localhost:8000):

1. Update `/lib/api.ts` to make real HTTP calls instead of mock responses
2. Replace mock delays with actual API calls
3. Use fetch or axios for HTTP requests
4. Handle real error responses

Example:
```typescript
async getDashboard(): Promise<{ incidents: Incident[]; stats: DashboardStats }> {
  const response = await fetch(`${API_URL}/dashboard`);
  const data = await response.json();
  return data;
}
```

## 🎨 Customization

### Colors
Update colors in component files or create a theme configuration

### API Endpoints
Modify `/lib/api.ts` with your actual endpoints

### Features
Each component is modular and can be customized independently

## 📦 Components Structure

```
/components
├── Navbar.tsx - Navigation bar with page routing
├── LandingPage.tsx - Hero and marketing content
├── Dashboard.tsx - Main dashboard layout
├── AdvancedFeatures.tsx - Advanced features page
├── AboutPage.tsx - About and contact
├── ModernMap.tsx - Interactive incident map
├── IncidentFeed.tsx - Scrollable incident list
├── IncidentCard.tsx - Individual incident display
├── StatsPanel.tsx - Dashboard statistics
├── SearchAndFilter.tsx - Search and filtering
├── UploadZone.tsx - File upload component
├── FloatingChatbot.tsx - AI assistant chat
├── SocialMediaPanel.tsx - Social media analysis
└── SatellitePanel.tsx - Satellite imagery analysis
```

## 🎯 Next Steps

1. **Connect Real Backend**: Replace mock API calls with real endpoints
2. **Add Authentication**: Implement user login/signup
3. **Real-time Updates**: Integrate WebSocket for live incident updates
4. **Map Integration**: Replace visual map with MapLibre GL JS
5. **Image Optimization**: Add lazy loading and CDN
6. **Error Handling**: Implement comprehensive error boundaries
7. **Testing**: Add unit and integration tests
8. **Performance**: Optimize bundle size and rendering

## 🌟 Key Features Highlights

- **Real-time Monitoring**: Live incident feed with instant updates
- **AI-Powered**: Gemini Vision integration ready
- **Multi-Source**: Social media, satellite, and user reports
- **Verified System**: Trust indicators for incident authenticity
- **Smart Search**: Semantic search with filtering
- **Batch Upload**: Process up to 100 files at once
- **Interactive Map**: Visual incident tracking
- **Professional UI**: Modern, clean, emergency-focused design

---

Built with ❤️ for emergency responders worldwide
