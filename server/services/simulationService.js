const Sensor = require('../models/Sensor');

/**
 * PUNE AQI SIMULATION ENGINE
 * Generates randomized but realistic sensor data for various Pune neighborhoods
 * to demonstrate live dashboard functionality without physical hardware.
 */

const PUNE_LOCATIONS = [
  { name: 'Kothrud', lat: 18.5074, lon: 73.8077 },
  { name: 'Hinjewadi', lat: 18.5913, lon: 73.7389 },
  { name: 'Baner', lat: 18.5590, lon: 73.7799 },
  { name: 'Swargate', lat: 18.5018, lon: 73.8636 },
  { name: 'Hadapsar', lat: 18.5089, lon: 73.9259 },
  { name: 'Viman Nagar', lat: 18.5679, lon: 73.9143 },
  { name: 'Shivaji Nagar', lat: 18.5314, lon: 73.8446 }
];

let simulationInterval = null;

const generateRandomData = (location) => {
  // Simulate common Pune ranges (Summer/Traffic profile)
  const aqi = Math.floor(Math.random() * (250 - 45 + 1)) + 45; // 45 to 250
  const temperature = parseFloat((Math.random() * (39 - 24) + 24).toFixed(1)); // 24 to 39 C
  const humidity = Math.floor(Math.random() * (65 - 30 + 1)) + 30; // 30 to 65 %
  const dust = Math.floor(aqi * 0.6) + Math.floor(Math.random() * 20); // Scale dust with AQI
  const gas = Math.floor(aqi * 2.5) + Math.floor(Math.random() * 50); // Scale gas with AQI

  return {
    aqi,
    dust,
    gas,
    temperature,
    humidity,
    lat: location.lat,
    lon: location.lon,
    location: location.name,
    timestamp: new Date()
  };
};

const startSimulation = (io) => {
  if (simulationInterval) return;

  console.log('🚀 Pune AQI Simulation Engine Started');
  
  simulationInterval = setInterval(async () => {
    // Pick a random location
    const location = PUNE_LOCATIONS[Math.floor(Math.random() * PUNE_LOCATIONS.length)];
    const data = generateRandomData(location);

    try {
      // 1. Save to MongoDB for persistence (History charts)
      const newSensor = new Sensor(data);
      await newSensor.save();

      // 2. Broadcast via Socket.io for Real-time Dashboard update
      if (io) {
        io.emit('newSensorData', { 
          success: true, 
          data: data,
          alert: data.aqi > 200 ? `CRITICAL AQI in ${location.name}!` : null
        });
        console.log(`[SIM] Data Pushed for ${location.name}: AQI ${data.aqi}`);
      }
    } catch (err) {
      console.error('Simulation Error:', err.message);
    }
  }, 10000); // Generate new points every 10 seconds
};

const stopSimulation = () => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    console.log('🛑 Pune AQI Simulation Engine Stopped');
  }
};

module.exports = { startSimulation, stopSimulation };
