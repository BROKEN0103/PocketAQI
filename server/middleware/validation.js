const validateSensorData = (req, res, next) => {
  const { aqi, dust, gas, temperature, humidity, lat, lon } = req.body;
  
  if (
    typeof aqi !== 'number' ||
    typeof dust !== 'number' ||
    typeof gas !== 'number' ||
    typeof temperature !== 'number' ||
    typeof humidity !== 'number' ||
    typeof lat !== 'number' ||
    typeof lon !== 'number'
  ) {
    return res.status(400).json({ success: false, message: 'Invalid data format. All fields must be numbers.' });
  }

  // Basic range validation
  if (aqi < 0 || aqi > 5000) return res.status(400).json({ success: false, message: 'Invalid AQI value. Must be between 0 and 5000.' });
  if (temperature < -50 || temperature > 85) return res.status(400).json({ success: false, message: 'Invalid temperature value. Must be between -50 and 85.' });
  if (humidity < 0 || humidity > 100) return res.status(400).json({ success: false, message: 'Invalid humidity value. Must be between 0 and 100.' });
  if (lat < -90 || lat > 90) return res.status(400).json({ success: false, message: 'Invalid latitude value. Must be between -90 and 90.' });
  if (lon < -180 || lon > 180) return res.status(400).json({ success: false, message: 'Invalid longitude value. Must be between -180 and 180.' });
  
  next();
};

module.exports = validateSensorData;
