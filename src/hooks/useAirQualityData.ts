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

function generateReading(base?: SensorReading): SensorReading {
  const now = new Date();
  const b = base || { aqi: 72, temperature: 26, humidity: 55, gasLevel: 120, dustPM: 35 };
  return {
    timestamp: now.toISOString(),
    aqi: Math.max(0, Math.min(500, b.aqi + (Math.random() - 0.5) * 20)),
    temperature: Math.max(-10, Math.min(50, b.temperature + (Math.random() - 0.5) * 2)),
    humidity: Math.max(0, Math.min(100, b.humidity + (Math.random() - 0.5) * 5)),
    gasLevel: Math.max(0, Math.min(1000, b.gasLevel + (Math.random() - 0.5) * 30)),
    dustPM: Math.max(0, Math.min(500, b.dustPM + (Math.random() - 0.5) * 10)),
  };
}

function generateHistory(count: number): SensorReading[] {
  const readings: SensorReading[] = [];
  let current: SensorReading | undefined;
  for (let i = count; i >= 0; i--) {
    current = generateReading(current);
    const t = new Date();
    t.setMinutes(t.getMinutes() - i * 5);
    current.timestamp = t.toISOString();
    readings.push({ ...current });
  }
  return readings;
}

export function useAirQualityData() {
  const [latest, setLatest] = useState<SensorReading | null>(null);
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = useCallback(() => {
    try {
      const hist = history.length > 0 ? history : generateHistory(48);
      const newReading = generateReading(hist[hist.length - 1]);
      const updatedHistory = [...hist.slice(-47), newReading];
      setHistory(updatedHistory);
      setLatest(newReading);
      setLastUpdated(new Date());
      setLoading(false);
      setError(null);
    } catch {
      setError("Failed to fetch sensor data");
      setLoading(false);
    }
  }, [history]);

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
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
