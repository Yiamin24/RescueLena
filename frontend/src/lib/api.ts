// API utilities for RescueLena - Connected to Backend

import { Incident, DashboardStats, SocialMediaAnalysis, SatelliteAnalysis } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper function to handle API errors
function handleApiError(error: any, defaultMessage: string): never {
  console.error('API Error:', error);
  const message = error.response?.data?.detail || error.message || defaultMessage;
  throw new Error(message);
}

// Real API functions connected to backend
export const api = {
  // Get all incidents from dashboard
  async getDashboard(): Promise<{ incidents: Incident[]; stats: DashboardStats }> {
    try {
      console.log('Fetching dashboard from:', `${API_URL}/dashboard`);
      const response = await fetch(`${API_URL}/dashboard`);
      
      if (!response.ok) {
        console.error('Dashboard fetch failed:', response.status, response.statusText);
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      console.log('✅ Dashboard data received:', data);
      console.log('📊 Incidents count:', data.incidents?.length || 0);
      
      const incidents = data.incidents || [];
      const stats = data.stats || {
        total_incidents: incidents.length,
        high_urgency: incidents.filter((i: Incident) => i.urgency === 'high').length,
        active_responders: Math.floor(incidents.length * 0.3),
        avg_response_time: 12,
      };
      
      console.log('📈 Stats:', stats);
      
      return { incidents, stats };
    } catch (error) {
      console.error('Dashboard error:', error);
      handleApiError(error, 'Failed to load dashboard');
    }
  },

  // Analyze image
  async analyzeImage(file: File): Promise<Incident> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_URL}/analyze/image`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Failed to analyze image');
      
      const data = await response.json();
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to analyze image');
    }
  },

  // Analyze text
  async analyzeText(text: string): Promise<Incident> {
    try {
      const response = await fetch(`${API_URL}/analyze/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) throw new Error('Failed to analyze text');
      
      const data = await response.json();
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to analyze text');
    }
  },

  // Analyze document (PDF/DOCX)
  async analyzeDocument(file: File): Promise<Incident> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_URL}/analyze/document`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Failed to analyze document');
      
      const data = await response.json();
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to analyze document');
    }
  },

  // Semantic search
  async query(searchText: string): Promise<Incident[]> {
    try {
      const response = await fetch(`${API_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchText }),
      });
      
      if (!response.ok) throw new Error('Failed to search incidents');
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      handleApiError(error, 'Failed to search incidents');
    }
  },

  // Chat with AI
  async chat(message: string): Promise<string> {
    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      
      if (!response.ok) throw new Error('Failed to get chat response');
      
      const data = await response.json();
      return data.response;
    } catch (error) {
      handleApiError(error, 'Failed to get chat response');
    }
  },

  // Verify incident
  async verifyIncident(id: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/verify/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) throw new Error('Failed to verify incident');
      
      const data = await response.json();
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to verify incident');
    }
  },

  // Update incident status
  async updateStatus(id: string, status: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/status/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) throw new Error('Failed to update status');
      
      const data = await response.json();
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to update status');
    }
  },

  // Analyze social media post
  async analyzeSocialMedia(postText: string): Promise<SocialMediaAnalysis> {
    try {
      const response = await fetch(`${API_URL}/social/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: postText,
          source: 'twitter',
          user: 'anonymous'
        }),
      });
      
      if (!response.ok) throw new Error('Failed to analyze social media');
      
      const data = await response.json();
      
      // Format response to match SocialMediaAnalysis type
      return {
        incident_type: data.type,
        urgency: data.urgency,
        location: data.location || 'Unknown',
        confidence: data.confidence,
        created: true
      };
    } catch (error) {
      handleApiError(error, 'Failed to analyze social media');
    }
  },

  // Analyze satellite imagery
  async analyzeSatellite(
    lat: number, 
    lng: number, 
    radius: number, 
    analysisType: string
  ): Promise<SatelliteAnalysis> {
    try {
      const response = await fetch(`${API_URL}/satellite/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          radius_km: radius,
          analysis_type: analysisType,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to analyze satellite imagery');
      
      const data = await response.json();
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to analyze satellite imagery');
    }
  },

  // Batch upload images
  async batchUpload(files: File[]): Promise<{ results: Incident[]; failed: number }> {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      
      const response = await fetch(`${API_URL}/batch/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Failed to batch upload');
      
      const data = await response.json();
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to batch upload');
    }
  },

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  },
};

// Helper function to format relative time
export function getRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

// Helper function to get urgency color
export function getUrgencyColor(urgency: string): string {
  switch (urgency) {
    case 'high': return '#FF3B30';
    case 'medium': return '#FF9500';
    case 'low': return '#34C759';
    default: return '#94A3B8';
  }
}
