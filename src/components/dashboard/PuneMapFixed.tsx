import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapData {
  aqi: number;
  dust: number;
  gas: number;
  temperature: number;
  humidity: number;
  lat: number;
  lon: number;
  timestamp: string;
}

const getAQIColor = (aqi: number): { color: string; label: string } => {
  if (aqi <= 50) return { color: '#10b981', label: 'Good' };
  if (aqi <= 100) return { color: '#facc15', label: 'Moderate' };
  if (aqi <= 200) return { color: '#f97316', label: 'Bad' };
  if (aqi <= 300) return { color: '#ef4444', label: 'Very Bad' };
  return { color: '#a855f7', label: 'Hazardous' };
};

export function PuneMapFixed() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const [sensors, setSensors] = useState<MapData[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialization Effect
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    console.log("PuneMapFixed: Booting Map Engine...");
    
    // Pune, Maharashtra Coordinates
    const puneCoord: L.LatLngExpression = [18.5204, 73.8567];
    
    leafletMap.current = L.map(mapRef.current, {
      center: puneCoord,
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(leafletMap.current);

    markersLayer.current = L.layerGroup().addTo(leafletMap.current);

    return () => {
      if (leafletMap.current) {
        console.log("PuneMapFixed: Cleaning up...");
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Data Sync Effect
  useEffect(() => {
    const fetchData = async () => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || ""; // Default uses proxy/relative path
      try {
        const response = await fetch(`${baseUrl}/api/map-data`);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const json = await response.json();
        if (json.success && Array.isArray(json.data)) {
          console.log(`PuneMapFixed: Synced ${json.data.length} sensors.`);
          setSensors(json.data);
        }
      } catch (err) {
        console.error("PuneMapFixed: Sync Failed.", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Setup Socket Listener for Real-time Marker Updates
    import('../../lib/socket').then(({ socket }) => {
      socket.on('newSensorData', (push: { success: boolean; data: any }) => {
        if (push.success && push.data) {
          const r = push.data;
          setSensors(prev => {
            // Check if we already have this sensor (matching lat/lon) to update it, or add new
            const exists = prev.findIndex(s => s.lat === r.lat && s.lon === r.lon);
            if (exists !== -1) {
              const updated = [...prev];
              updated[exists] = r;
              return updated;
            }
            return [r, ...prev];
          });
          console.log("Map: Real-time update received.");
        }
      });

      return () => {
        socket.off('newSensorData');
      };
    });

    const timer = setInterval(fetchData, 30000); // Polling reduced to 30s as fallback
    return () => clearInterval(timer);
  }, []);

  // Marker Update Effect
  useEffect(() => {
    if (!markersLayer.current || !leafletMap.current) return;

    markersLayer.current.clearLayers();

    sensors.forEach((s) => {
      // Guard against null/undefined coordinates from old DB records
      if (s.lat == null || s.lon == null || isNaN(s.lat) || isNaN(s.lon)) {
        console.warn(`PuneMapFixed: Skipping sensor with invalid coords: lat=${s.lat}, lon=${s.lon}`);
        return;
      }
      
      const { color, label } = getAQIColor(s.aqi);
      
      const marker = L.circleMarker([s.lat, s.lon], {
        radius: 12,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      });

      const popupHtml = `
        <div style="font-family: sans-serif; min-width: 150px; padding: 5px;">
          <strong style="color: ${color}; font-size: 14px;">${label} (${s.aqi} AQI)</strong>
          <div style="margin-top: 8px; font-size: 12px; border-top: 1px solid #eee; pt: 5px;">
            <b>Loc:</b> ${s.lat.toFixed(3)}, ${s.lon.toFixed(3)}<br/>
            <b>Dust:</b> ${s.dust.toFixed(1)} µg/m³<br/>
            <b>Gas:</b> ${s.gas.toFixed(0)} ppm<br/>
            <b>Temp:</b> ${s.temperature.toFixed(1)}°C
          </div>
          <div style="font-size: 10px; color: #aaa; margin-top: 5px;">
            Updated: ${new Date(s.timestamp).toLocaleTimeString()}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.bindTooltip(`${s.aqi} AQI`, { direction: 'top', offset: [0, -10] });
      
      markersLayer.current?.addLayer(marker);
    });
  }, [sensors]);

  return (
    <div className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden glass-card border-none relative shadow-2xl">
      <div 
        ref={mapRef} 
        className="w-full h-full" 
        style={{ background: '#1a1b1e', height: '100%', width: '100%' }} 
      />
      
      {loading && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-[2000]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium animate-pulse">Initializing Pune Sensor Network...</p>
          </div>
        </div>
      )}

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-md p-3 rounded-lg border shadow-lg z-[1000] text-xs space-y-2 pointer-events-none">
        <div className="font-bold border-b pb-1 mb-1">AQI Legend</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#10b981]" /> Good (0-50)</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#facc15]" /> Moderate (51-100)</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#f97316]" /> Bad (101-200)</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#ef4444]" /> Very Bad (201+)</div>
      </div>
    </div>
  );
}
