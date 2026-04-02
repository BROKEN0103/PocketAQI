const Sensor = require('../models/Sensor');
const predictionService = require('../services/predictionService');
const alertService = require('../services/alertService');
const recommendationService = require('../services/recommendationService');
const anomalyService = require('../services/anomalyService');
const insightService = require('../services/insightService');

const getHistoricalData = async (limit = 100) => {
  return await Sensor.find().sort({ timestamp: -1 }).limit(limit).lean();
};

exports.getPrediction = async (req, res) => {
  const data = await getHistoricalData();
  const predictions = predictionService.predictAQI(data);
  res.json(predictions);
};

exports.getAlerts = async (req, res) => {
  const data = await getHistoricalData();
  const alerts = alertService.detectAlerts(data);
  res.json({ alerts });
};

exports.getRecommendations = async (req, res) => {
  const data = await getHistoricalData(1);
  const currentAqi = data.length > 0 ? data[0].aqi : null;
  const recommendation = recommendationService.getRecommendations(currentAqi);
  res.json({ recommendation });
};

exports.getAnomalies = async (req, res) => {
  const data = await getHistoricalData();
  const anomalies = anomalyService.detectAnomalies(data);
  res.json({ anomalies });
};

exports.getTrends = async (req, res) => {
  const data = await getHistoricalData();
  const trend = insightService.getTrends(data);
  res.json({ trend });
};

exports.getInsights = async (req, res) => {
  const data = await getHistoricalData();
  const insights = insightService.getInsights(data);
  res.json({ insights });
};
