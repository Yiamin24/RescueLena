// WebSocket connection for real-time updates

import { io, Socket } from 'socket.io-client';
import { Incident } from './types';

const WS_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect() {
    if (this.socket?.connected) return;

    try {
      this.socket = io(WS_URL, {
        transports: ['polling', 'websocket'], // Try polling first
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 3,
        timeout: 5000,
      });

      this.socket.on('connect', () => {
        console.log('✅ WebSocket connected');
      });

      this.socket.on('connect_error', (error) => {
        console.warn('⚠️ WebSocket connection error (non-critical):', error.message);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ WebSocket disconnected:', reason);
      });

      this.socket.on('new_incident', (incident: Incident) => {
        this.emit('new_incident', incident);
      });

      this.socket.on('incident_updated', (incident: Incident) => {
        this.emit('incident_updated', incident);
      });

      this.socket.on('incident_verified', (data: { id: string }) => {
        this.emit('incident_verified', data);
      });
    } catch (error) {
      console.warn('⚠️ Failed to initialize WebSocket (non-critical):', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const wsService = new WebSocketService();
