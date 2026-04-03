const axios = require('axios');

const API_URL = 'http://localhost:5000/api/sensor';
const API_KEY = 'esp32_secret_key_change_me';

const locations = [
  { lat: 40.7128, lon: -74.0060, name: 'Manhattan' },
  { lat: 40.6782, lon: -73.9442, name: 'Brooklyn' },
  { lat: 40.7282, lon: -73.7949, name: 'Queens' },
  { lat: 40.8448, lon: -73.8648, name: 'Bronx' }
];

const seed = async () => {
  console.log('Seeding data to AQIS Backend...');
  for (let i = 0; i < 20; i++) {
    const loc = locations[i % locations.length];
    
    // Vary the metrics wildly so the map colors have contrast
    const data = {
      aqi: 20 + Math.floor(Math.random() * 350), // Random from 20 to 370 (covers Green to Purple)
      dust: 10 + Math.random() * 80,
      gas: 100 + Math.floor(Math.random() * 900),
      temperature: 20 + Math.random() * 10,
      humidity: 40 + Math.random() * 30,
      lat: loc.lat,
      lon: loc.lon
    };
    
    try {
      const res = await axios.post(API_URL, data, {
        headers: { 'x-api-key': API_KEY }
      });
      console.log(`[${i+1}] Saved for ${loc.name}: AQI ${data.aqi}`);
    } catch (err) {
      console.error(`Error saving data: ${err.message}`);
    }
    // Small delay to simulate time-series
    await new Promise(r => setTimeout(r, 100));
  }
  console.log('Seeding complete.');
};

seed();
