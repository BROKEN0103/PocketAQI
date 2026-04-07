const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
  aqi: { type: Number, required: true },
  dust: { type: Number, required: true },
  gas: { type: Number, required: true },
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  location: { type: String, default: 'ESP32 Device' },
  timestamp: { type: Date, default: Date.now }
});

sensorSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Sensor', sensorSchema);
