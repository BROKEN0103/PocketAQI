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
  
  next();
};

module.exports = validateSensorData;
