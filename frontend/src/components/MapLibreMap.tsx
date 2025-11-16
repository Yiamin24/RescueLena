import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Incident } from '../lib/types';
import { getUrgencyColor } from '../lib/api';

interface MapLibreMapProps {
  incidents: Incident[];
  onIncidentClick?: (incident: Incident) => void;
}

export function MapLibreMap({ incidents, onIncidentClick }: MapLibreMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map with OpenStreetMap style
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [{
          id: 'osm',
          type: 'raster',
          source: 'osm',
          minzoom: 0,
          maxzoom: 19
        }]
      },
      center: [55.2708, 25.2048], // Dubai center
      zoom: 10,
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update markers when incidents change
  useEffect(() => {
    if (!map.current) return;

    // Remove old markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers
    incidents.forEach(incident => {
      if (!map.current) return;

      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = getUrgencyColor(incident.urgency);
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([incident.longitude, incident.latitude])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 8px; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">
                ${incident.type.replace(/_/g, ' ').toUpperCase()}
              </h3>
              <p style="margin: 4px 0; font-size: 12px;">
                <strong>Location:</strong> ${incident.location}
              </p>
              <p style="margin: 4px 0; font-size: 12px;">
                <strong>Urgency:</strong> 
                <span style="color: ${getUrgencyColor(incident.urgency)}; font-weight: bold;">
                  ${incident.urgency.toUpperCase()}
                </span>
              </p>
              <p style="margin: 4px 0; font-size: 12px;">
                ${incident.description}
              </p>
              ${incident.verified ? '<p style="margin: 4px 0; font-size: 12px; color: green;">✓ Verified</p>' : ''}
            </div>
          `)
        )
        .addTo(map.current);

      if (onIncidentClick) {
        el.addEventListener('click', () => onIncidentClick(incident));
      }

      markers.current.push(marker);
    });

    // Fit bounds to show all markers
    if (incidents.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      incidents.forEach(incident => {
        bounds.extend([incident.longitude, incident.latitude]);
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }
  }, [incidents, onIncidentClick]);

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-full rounded-lg"
      style={{ minHeight: '400px' }}
    />
  );
}
