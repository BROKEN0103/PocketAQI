const auth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.ESP32_API_KEY) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid API Key' });
  }
  next();
};

module.exports = auth;
