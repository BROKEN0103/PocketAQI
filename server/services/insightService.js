exports.getTrends = (historicalData) => {
  if (!historicalData || historicalData.length < 5) return "Stable";

  const firstHalf = historicalData.slice(0, Math.floor(historicalData.length / 2));
  const secondHalf = historicalData.slice(Math.floor(historicalData.length / 2));

  const firstAvg = firstHalf.reduce((s, r) => s + r.aqi, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((s, r) => s + r.aqi, 0) / secondHalf.length;

  if (firstAvg > secondAvg * 1.05) return "Increasing";
  if (firstAvg < secondAvg * 0.95) return "Decreasing";
  return "Stable";
};

exports.getInsights = (historicalData) => {
  const insights = [];
  if (!historicalData || historicalData.length < 10) return insights;

  const trend = this.getTrends(historicalData);
  insights.push(`Air Quality is currently overall ${trend.toLowerCase()}.`);

  let humHighDustHigh = 0;
  let totalHighHum = 0;
  historicalData.forEach(r => {
    if (r.humidity > 60) {
      totalHighHum++;
      if (r.dust > 100) humHighDustHigh++;
    }
  });

  if (totalHighHum > 5 && (humHighDustHigh / totalHighHum) > 0.6) {
    insights.push("High humidity correlates with higher dust levels.");
  }

  return insights;
};
