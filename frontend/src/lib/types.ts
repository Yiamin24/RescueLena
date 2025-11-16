// TypeScript interfaces for RescueLena

export type IncidentType = 
  | 'fire' 
  | 'flood' 
  | 'people_trapped' 
  | 'building_collapse' 
  | 'medical' 
  | 'earthquake' 
  | 'landslide' 
  | 'other';

export type UrgencyLevel = 'high' | 'medium' | 'low';
export type IncidentStatus = 'pending' | 'in_progress' | 'resolved' | 'false_alarm';

export interface Incident {
  id: string;
  type: IncidentType;
  latitude: number;
  longitude: number;
  urgency: UrgencyLevel;
  confidence: number;
  timestamp: string;
  description: string;
  location: string;
  people_affected?: number;
  image_url?: string;
  verified?: boolean;
  verified_by?: string;
  status?: IncidentStatus;
  archived?: boolean;
}

export interface DashboardStats {
  total_incidents: number;
  high_urgency: number;
  active_responders: number;
  avg_response_time: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

export interface SocialMediaAnalysis {
  incident_type: IncidentType;
  urgency: UrgencyLevel;
  location: string;
  confidence: number;
  created: boolean;
}

export interface SatelliteAnalysis {
  analysis_date: string;
  detected_changes: string[];
  risk_assessment: string;
  sources: string[];
}
