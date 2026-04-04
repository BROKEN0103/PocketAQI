const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');
const auth = require('../middleware/auth');
const validateSensorData = require('../middleware/validation');

// Core API endpoints
router.post('/sensor', auth, validateSensorData, sensorController.createSensorData);
router.post('/test', sensorController.createTestData);
router.get('/latest', sensorController.getLatestData);
router.get('/history', sensorController.getHistoryData);
router.get('/analytics', sensorController.getAnalyticsData);
router.get('/map-data', sensorController.getMapData);

module.exports = router;
