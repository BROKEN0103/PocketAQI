const validateSensorData = (req, res, next) => {
  const { aqi, dust, gas, temperature, humidity } = req.body;
  
  if (
    typeof aqi !== 'number' ||
    typeof dust !== 'number' ||
    typeof gas !== 'number' ||
    typeof temperature !== 'number' ||
    typeof humidity !== 'number'
  ) {
    return res.status(400).json({ success: false, message: 'Invalid data format. All fields must be numbers.' });
  }
  
  next();
};

module.exports = validateSensorData;
