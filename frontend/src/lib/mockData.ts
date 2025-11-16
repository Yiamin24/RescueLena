// Type definitions and utilities for RescueLena

import { Incident, DashboardStats } from './types';

// No mock data - all data comes from real backend

export const incidentTypeEmojis: Record<string, string> = {
  fire: '🔥',
  flood: '🌊',
  people_trapped: '🆘',
  building_collapse: '🏚️',
  medical: '🚑',
  earthquake: '🌍',
  landslide: '⛰️',
  other: '⚠️',
};

export const incidentTypeLabels: Record<string, string> = {
  fire: 'Fire Emergency',
  flood: 'Flood',
  people_trapped: 'People Trapped',
  building_collapse: 'Building Collapse',
  medical: 'Medical Emergency',
  earthquake: 'Earthquake',
  landslide: 'Landslide',
  other: 'Other',
};
