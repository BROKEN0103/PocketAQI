import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip as LeafletTooltip } from 'react-leaflet';
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

const getAQIStyle = (aqi: number) => {
  if (aqi <= 50) return { color: '#10b981', label: 'Good' }; // Green
  if (aqi <= 100) return { color: '#facc15', label: 'Moderate' }; // Yellow
  if (aqi <= 200) return { color: '#f97316', label: 'Unhealthy' }; // Orange
  if (aqi <= 300) return { color: '#ef4444', label: 'Very Unhealthy' }; // Red
  return { color: '#a855f7', label: 'Hazardous' }; // Purple
};

export function LiveMap() {
  const [sensors, setSensors] = useState<MapData[]>([]);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/map-data');
        if (!response.ok) throw new Error('API fetching failed');
        const data = await response.json();
        
        if (data.success && data.data) {
          setSensors(data.data);
        }
      } catch (error) {
        console.error('Error fetching map data:', error);
      }
    };

    fetchMapData();
    const interval = setInterval(fetchMapData, 5000);
    return () => clearInterval(interval);
  }, []);

  const defaultCenter: [number, number] = [40.7128, -74.0060]; // New York

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border bg-card">
      <MapContainer 
        center={defaultCenter} 
        zoom={11} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {sensors.map((sensor, index) => {
          const { color, label } = getAQIStyle(sensor.aqi);
          return (
            <CircleMarker
              key={index}
              center={[sensor.lat, sensor.lon]}
              pathOptions={{ fillColor: color, color: color, fillOpacity: 0.7 }}
              radius={15}
            >
              <LeafletTooltip direction="top" offset={[0, -10]} opacity={1}>
                <span className="font-bold">AQI: {sensor.aqi}</span>
              </LeafletTooltip>

              <Popup>
                <div className="p-1">
                  <h4 className="font-bold border-b pb-1 mb-2">Sensor Information</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium" style={{ color }}>{label} ({sensor.aqi})</span>
                    
                    <span className="text-muted-foreground">Dust PM2.5:</span>
                    <span>{sensor.dust.toFixed(1)} µg/m³</span>
                    
                    <span className="text-muted-foreground">Gas (MQ135):</span>
                    <span>{sensor.gas.toFixed(0)}</span>
                    
                    <span className="text-muted-foreground">Temperature:</span>
                    <span>{sensor.temperature.toFixed(1)} °C</span>
                    
                    <span className="text-muted-foreground">Humidity:</span>
                    <span>{sensor.humidity.toFixed(1)} %</span>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground border-t pt-1">
                    Updated: {new Date(sensor.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
