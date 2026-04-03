const axios = require('axios');

const API_URL = 'http://localhost:5000/api/sensor';
const API_KEY = 'esp32_secret_key_change_me';

const locations = [
  { lat: 18.5074, lon: 73.8077, name: 'Kothrud' },
  { lat: 18.5679, lon: 73.9143, name: 'Viman Nagar' },
  { lat: 18.5913, lon: 73.7389, name: 'Hinjewadi IT Park' },
  { lat: 18.5089, lon: 73.9259, name: 'Hadapsar' },
  { lat: 18.5147, lon: 73.8758, name: 'Pune Camp' }
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
