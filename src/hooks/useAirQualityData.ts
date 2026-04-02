import { useState, useEffect, useCallback } from "react";

export interface SensorReading {
  timestamp: string;
  aqi: number;
  temperature: number;
  humidity: number;
  gasLevel: number;
  dustPM: number;
}

export interface AQICategory {
  label: string;
  color: string;
  suggestion: string;
}

export function getAQICategory(aqi: number): AQICategory {
  if (aqi <= 50) return { label: "GOOD", color: "text-aqi-good", suggestion: "Air quality is satisfactory. Enjoy outdoor activities." };
  if (aqi <= 100) return { label: "MODERATE", color: "text-aqi-moderate", suggestion: "Acceptable quality. Sensitive individuals should limit prolonged outdoor exertion." };
  if (aqi <= 200) return { label: "BAD", color: "text-aqi-bad", suggestion: "Unhealthy for sensitive groups. Reduce prolonged outdoor activities." };
  if (aqi <= 300) return { label: "VERY BAD", color: "text-aqi-very-bad", suggestion: "Health alert! Everyone may experience health effects. Avoid outdoor activities." };
  return { label: "HAZARDOUS", color: "text-aqi-hazardous", suggestion: "Emergency conditions. Stay indoors and use air purifiers." };
}

export function getAQIBgClass(aqi: number): string {
  if (aqi <= 50) return "bg-aqi-good";
  if (aqi <= 100) return "bg-aqi-moderate";
  if (aqi <= 200) return "bg-aqi-bad";
  if (aqi <= 300) return "bg-aqi-very-bad";
  return "bg-aqi-hazardous";
}

export function useAirQualityData() {
  const [latest, setLatest] = useState<SensorReading | null>(null);
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    try {
      const histRes = await fetch("http://localhost:5000/api/history");
      const latestRes = await fetch("http://localhost:5000/api/latest");
      
      if (!histRes.ok || !latestRes.ok) {
         if (histRes.status === 404 || latestRes.status === 404) {
             setError("No sensor data found yet. Please start sending ESP32 data.");
             setLoading(false);
             return;
         }
         throw new Error("Failed to fetch");
      }

      const histData = await histRes.json();
      const latestData = await latestRes.json();

      if (histData.success && histData.data) {
        const mappedHistory = histData.data.map((r: any) => ({
           timestamp: r.timestamp,
           aqi: r.aqi,
           temperature: r.temperature,
           humidity: r.humidity,
           gasLevel: r.gas, // Map backend 'gas' to frontend 'gasLevel'
           dustPM: r.dust    // Map backend 'dust' to frontend 'dustPM'
        })).reverse();
        setHistory(mappedHistory);
      }
      
      if (latestData.success && latestData.data) {
        const r = latestData.data;
        setLatest({
           timestamp: r.timestamp,
           aqi: r.aqi,
           temperature: r.temperature,
           humidity: r.humidity,
           gasLevel: r.gas,
           dustPM: r.dust
        });
      }

      setLastUpdated(new Date());
      setLoading(false);
      setError(null);
    } catch {
      setError("Failed to connect to backend Server on 5000");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const alerts: string[] = [];
  if (latest) {
    let thresholds = { aqiWarning: 100, aqiCritical: 200, gasWarning: 200, gasCritical: 300, dustWarning: 100, dustCritical: 150, tempHigh: 40, tempLow: 0, humidityHigh: 80, humidityLow: 20 };
    try {
      const stored = localStorage.getItem("airq-thresholds");
      if (stored) thresholds = { ...thresholds, ...JSON.parse(stored) };
    } catch {}

    if (latest.aqi > thresholds.aqiCritical) alerts.push(`🚨 AQI critical: ${Math.round(latest.aqi)} (threshold: ${thresholds.aqiCritical})`);
    else if (latest.aqi > thresholds.aqiWarning) alerts.push(`⚠️ AQI warning: ${Math.round(latest.aqi)} (threshold: ${thresholds.aqiWarning})`);
    if (latest.gasLevel > thresholds.gasCritical) alerts.push(`🚨 Gas critical: ${Math.round(latest.gasLevel)} ppm (threshold: ${thresholds.gasCritical})`);
    else if (latest.gasLevel > thresholds.gasWarning) alerts.push(`⚠️ Gas warning: ${Math.round(latest.gasLevel)} ppm (threshold: ${thresholds.gasWarning})`);
    if (latest.dustPM > thresholds.dustCritical) alerts.push(`🚨 Dust critical: ${Math.round(latest.dustPM)} µg/m³ (threshold: ${thresholds.dustCritical})`);
    else if (latest.dustPM > thresholds.dustWarning) alerts.push(`⚠️ Dust warning: ${Math.round(latest.dustPM)} µg/m³ (threshold: ${thresholds.dustWarning})`);
    if (latest.temperature > thresholds.tempHigh) alerts.push(`🌡️ Temp high: ${latest.temperature.toFixed(1)}°C (threshold: ${thresholds.tempHigh}°C)`);
    else if (latest.temperature < thresholds.tempLow) alerts.push(`🌡️ Temp low: ${latest.temperature.toFixed(1)}°C (threshold: ${thresholds.tempLow}°C)`);
    if (latest.humidity > thresholds.humidityHigh) alerts.push(`💧 Humidity high: ${latest.humidity.toFixed(1)}% (threshold: ${thresholds.humidityHigh}%)`);
    else if (latest.humidity < thresholds.humidityLow) alerts.push(`💧 Humidity low: ${latest.humidity.toFixed(1)}% (threshold: ${thresholds.humidityLow}%)`);
  }

  const downloadCSV = useCallback(() => {
    const headers = "Timestamp,AQI,Temperature,Humidity,Gas Level,Dust PM\n";
    const rows = history.map(r =>
      `${r.timestamp},${r.aqi.toFixed(1)},${r.temperature.toFixed(1)},${r.humidity.toFixed(1)},${r.gasLevel.toFixed(1)},${r.dustPM.toFixed(1)}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `air-quality-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [history]);

  return { latest, history, loading, error, lastUpdated, alerts, downloadCSV };
}
