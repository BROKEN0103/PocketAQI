const NodeCache = require('node-cache');
const Sensor = require('../models/Sensor');
const predictionService = require('../services/predictionService');
const alertService = require('../services/alertService');
const recommendationService = require('../services/recommendationService');
const anomalyService = require('../services/anomalyService');
const insightService = require('../services/insightService');

// Initialize cache with a Time-To-Live (TTL) of 30 seconds
const cache = new NodeCache({ stdTTL: 30 });

const getHistoricalData = async (limit = 100) => {
  return await Sensor.find().sort({ timestamp: -1 }).limit(limit).lean();
};

// Helper middleware for caching
const withCache = async (key, fetchCallback) => {
  const cachedData = cache.get(key);
  if (cachedData) {
    return cachedData;
  }
  const data = await fetchCallback();
  cache.set(key, data);
  return data;
};

exports.getPrediction = async (req, res) => {
  const predictions = await withCache('prediction', async () => {
    const data = await getHistoricalData();
    return predictionService.predictAQI(data);
  });
  res.json(predictions);
};

exports.getAlerts = async (req, res) => {
  const alertsObj = await withCache('alerts', async () => {
    const data = await getHistoricalData();
    const alerts = alertService.detectAlerts(data);
    return { alerts };
  });
  res.json(alertsObj);
};

exports.getRecommendations = async (req, res) => {
  const recommendationObj = await withCache('recommendations', async () => {
    const data = await getHistoricalData(1);
    const currentAqi = data.length > 0 ? data[0].aqi : null;
    const recommendation = recommendationService.getRecommendations(currentAqi);
    return { recommendation };
  });
  res.json(recommendationObj);
};

exports.getAnomalies = async (req, res) => {
  const anomaliesObj = await withCache('anomalies', async () => {
    const data = await getHistoricalData();
    const anomalies = anomalyService.detectAnomalies(data);
    return { anomalies };
  });
  res.json(anomaliesObj);
};

exports.getTrends = async (req, res) => {
  const trendObj = await withCache('trends', async () => {
    const data = await getHistoricalData();
    const trend = insightService.getTrends(data);
    return { trend };
  });
  res.json(trendObj);
};

exports.getInsights = async (req, res) => {
  const insightsObj = await withCache('insights', async () => {
    const data = await getHistoricalData();
    const insights = insightService.getInsights(data);
    return { insights };
  });
  res.json(insightsObj);
};
