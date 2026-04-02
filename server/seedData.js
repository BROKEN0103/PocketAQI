const axios = require('axios');

const API_URL = 'http://localhost:5000/api/sensor';
const API_KEY = 'esp32_secret_key_change_me';

const seed = async () => {
  console.log('Seeding data to AQIS Backend...');
  for (let i = 0; i < 10; i++) {
    const data = {
      aqi: 40 + Math.floor(Math.random() * 20),
      dust: 10 + Math.random() * 10,
      gas: 100 + Math.floor(Math.random() * 50),
      temperature: 22 + Math.random() * 5,
      humidity: 50 + Math.random() * 20
    };
    
    try {
      const res = await axios.post(API_URL, data, {
        headers: { 'x-api-key': API_KEY }
      });
      console.log(`[${i+1}] Saved: AQI ${data.aqi}`);
    } catch (err) {
      console.error(`Error saving data: ${err.message}`);
    }
    // Small delay to simulate time-series
    await new Promise(r => setTimeout(r, 100));
  }
  console.log('Seeding complete.');
};

seed();
