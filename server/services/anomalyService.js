exports.detectAnomalies = (historicalData) => {
  if (!historicalData || historicalData.length < 10) return [];

  const anomalies = [];
  const aqiValues = historicalData.map(d => d.aqi);
  const mean = aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length;
  
  const variance = aqiValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / aqiValues.length;
  const stdDev = Math.sqrt(variance);

  const latest = historicalData[0];
  const zScore = (latest.aqi - mean) / (stdDev || 1);

  if (Math.abs(zScore) > 2.5) {
    anomalies.push({
      metric: 'AQI',
      value: latest.aqi,
      severity: zScore > 0 ? 'High' : 'Low',
      description: `Unusual AQI value detected (${latest.aqi.toFixed(1)})`
    });
  }

  return anomalies;
};
