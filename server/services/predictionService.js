exports.predictAQI = (historicalData) => {
  if (!historicalData || historicalData.length === 0) {
    return { next1hr: null, next6hr: null, next24hr: null };
  }

  const recent = historicalData.slice(0, 10);
  const avgAQI = recent.reduce((sum, r) => sum + r.aqi, 0) / recent.length;

  let rateOfChange = 0;
  if (historicalData.length > 1) {
    const oldest = historicalData[historicalData.length - 1].aqi;
    const newest = historicalData[0].aqi;
    rateOfChange = (newest - oldest) / historicalData.length; 
  }

  const next1hr = Math.max(0, avgAQI + (rateOfChange * 12));
  const next6hr = Math.max(0, avgAQI + (rateOfChange * 72));
  const next24hr = Math.max(0, avgAQI + (rateOfChange * 288));

  return {
    next1hr: Math.round(next1hr),
    next6hr: Math.round(next6hr),
    next24hr: Math.round(next24hr)
  };
};
