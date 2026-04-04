const Sensor = require('../models/Sensor');

// Process alerts based on thresholds
const getAlertLevel = (aqi, gas) => {
  let alert = null;
  if (aqi > 400) alert = "HAZARDOUS";
  else if (aqi > 300) alert = "VERY BAD";
  else if (aqi > 200) alert = "BAD";
  
  // Example gas threshold from MQ135 sensor (can be adjusted)
  if (gas > 1000) {
    alert = alert ? `${alert} | HIGH GAS` : "HIGH GAS";
  }
  
  return alert;
};

exports.createSensorData = async (req, res) => {
  try {
    console.log('Incoming ESP32 Data:', req.body);
    const { aqi, dust, gas, temperature, humidity, lat, lon } = req.body;
    
    const newSensor = new Sensor({ aqi, dust, gas, temperature, humidity, lat, lon });
    await newSensor.save();
    
    const alert = getAlertLevel(aqi, gas);
    
    const io = req.app.get('io');
    if (io) {
      io.emit('newSensorData', { success: true, data: newSensor, alert: alert });
    }
    
    res.status(201).json({
      success: true,
      message: 'Sensor data saved successfully',
      alert: alert
    });
  } catch (error) {
    console.error('Error saving sensor data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createTestData = async (req, res) => {
  try {
    const dummyData = {
      aqi: Math.floor(Math.random() * 500),
      dust: Math.floor(Math.random() * 200),
      gas: Math.floor(Math.random() * 1500),
      temperature: 20 + Math.random() * 15,
      humidity: 40 + Math.random() * 40,
      lat: 18.5204 + (Math.random() - 0.5) * 0.1,
      lon: 73.8567 + (Math.random() - 0.5) * 0.1
    };

    const newSensor = new Sensor(dummyData);
    await newSensor.save();

    const alert = getAlertLevel(dummyData.aqi, dummyData.gas);
    
    const io = req.app.get('io');
    if (io) {
      io.emit('newSensorData', { success: true, data: newSensor, alert: alert });
    }

    res.status(201).json({
      success: true,
      message: 'Test sensor data generated successfully',
      data: newSensor,
      alert: alert
    });
  } catch (error) {
    console.error('Error creating test data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getLatestData = async (req, res) => {
  try {
    const latest = await Sensor.findOne().sort({ timestamp: -1 });
    if (!latest) {
      return res.status(404).json({ success: false, message: 'No data found' });
    }
    res.json({ success: true, data: latest });
  } catch (error) {
    console.error('Error fetching latest data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getHistoryData = async (req, res) => {
  try {
    const history = await Sensor.find().sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAnalyticsData = async (req, res) => {
  try {
    const analytics = await Sensor.aggregate([
      {
        $group: {
          _id: null,
          avgAqi: { $avg: '$aqi' },
          maxAqi: { $max: '$aqi' },
          minAqi: { $min: '$aqi' },
          avgTemperature: { $avg: '$temperature' },
          avgHumidity: { $avg: '$humidity' },
          avgGas: { $avg: '$gas' },
          avgDust: { $avg: '$dust' }
        }
      }
    ]);
    
    if (analytics.length === 0) {
      return res.status(404).json({ success: false, message: 'No data available for analytics' });
    }
    
    res.json({ success: true, data: analytics[0] });
  } catch (error) {
    console.error('Error calculating analytics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMapData = async (req, res) => {
  try {
    const mapData = await Sensor.aggregate([
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: { lat: '$lat', lon: '$lon' },
          id: { $first: '$_id' },
          aqi: { $first: '$aqi' },
          dust: { $first: '$dust' },
          gas: { $first: '$gas' },
          temperature: { $first: '$temperature' },
          humidity: { $first: '$humidity' },
          lat: { $first: '$lat' },
          lon: { $first: '$lon' },
          timestamp: { $first: '$timestamp' }
        }
      },
      {
        $project: { _id: 0 }
      }
    ]);
    res.json({ success: true, data: mapData });
  } catch (error) {
    console.error('Error fetching map data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
