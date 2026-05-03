const axios = require('axios');
const Sensor = require('../models/Sensor');

/**
 * ESP32 POLLING SERVICE
 * Periodically fetches sensor data from the ESP32 WebServer.
 */

let pollInterval = null;

const getAlertLevel = (aqi, gas) => {
  let alert = null;
  if (aqi > 400) alert = "HAZARDOUS";
  else if (aqi > 300) alert = "VERY BAD";
  else if (aqi > 200) alert = "BAD";
  
  if (gas > 1000) {
    alert = alert ? `${alert} | HIGH GAS` : "HIGH GAS";
  }
  return alert;
};

const processData = async (data, io) => {
  try {
    const newSensor = new Sensor(data);
    await newSensor.save();
    
    const alert = getAlertLevel(data.aqi, data.gas);
    
    if (io) {
      io.emit('newSensorData', { 
        success: true, 
        data: newSensor, 
        alert: alert 
      });
    }
    console.log(`[POLL] Data fetched from ESP32: AQI ${data.aqi}`);
  } catch (err) {
    console.error('[POLL] Error processing fetched data:', err.message);
  }
};

const startPolling = (io) => {
  const ip = process.env.ESP32_IP;
  const intervalTime = parseInt(process.env.POLL_INTERVAL) || 5000;
  
  if (!ip) {
    console.error('[POLL] ERROR: ESP32_IP not set in environment variables.');
    return;
  }

  if (pollInterval) return;

  console.log(`🔄 ESP32 Polling Service Started (Fetching from http://${ip}/data every ${intervalTime}ms)`);

  pollInterval = setInterval(async () => {
    try {
      const response = await axios.get(`http://${ip}/data`, { timeout: 3000 });
      if (response.data) {
        await processData(response.data, io);
      }
    } catch (err) {
      console.warn(`[POLL] Failed to fetch from ESP32 (${ip}): ${err.message}`);
    }
  }, intervalTime);
};

const stopPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
    console.log('🛑 ESP32 Polling Service Stopped');
  }
};

module.exports = { startPolling, stopPolling };
