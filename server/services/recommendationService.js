exports.getRecommendations = (currentAqi) => {
  if (currentAqi == null) return "No data available";

  if (currentAqi <= 50) return "Safe to go outside";
  if (currentAqi <= 100) return "Moderate: Focus on indoor activities if sensitive";
  if (currentAqi <= 200) return "Limit outdoor activity";
  if (currentAqi <= 300) return "Wear mask";
  if (currentAqi <= 400) return "Avoid outdoor exposure";
  return "Stay indoors";
};
