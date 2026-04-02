exports.detectAlerts = (historicalData) => {
  const alerts = [];
  if (!historicalData || historicalData.length === 0) return alerts;

  const latest = historicalData[0];
  
  if (latest.aqi > 400) alerts.push("CRITICAL: AQI is HAZARDOUS");
  else if (latest.aqi > 300) alerts.push("WARNING: AQI is VERY BAD");
  else if (latest.aqi > 200) alerts.push("WARNING: AQI is BAD");

  if (latest.gas > 800) alerts.push("CRITICAL: Dangerous gas levels detected");

  if (historicalData.length > 5) {
    const recentDust = latest.dust;
    const prevDustAvg = historicalData.slice(1, 6).reduce((s, r) => s + r.dust, 0) / 5;
    if (recentDust > prevDustAvg * 1.5 && recentDust > 50) {
      alerts.push("WARNING: Sudden dust increase detected");
    }
  }

  return alerts;
};
