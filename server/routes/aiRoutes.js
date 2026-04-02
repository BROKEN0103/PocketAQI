const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.get('/prediction', aiController.getPrediction);
router.get('/alerts', aiController.getAlerts);
router.get('/recommendations', aiController.getRecommendations);
router.get('/anomalies', aiController.getAnomalies);
router.get('/trends', aiController.getTrends);
router.get('/insights', aiController.getInsights);

module.exports = router;
