require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

const sensorRoutes = require('./routes/sensorRoutes');
const aiRoutes = require('./routes/aiRoutes');
const simulationService = require('./services/simulationService');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Logging incoming data

// Mount Routes
app.use('/api', sensorRoutes);
app.use('/api', aiRoutes);

// General Root Endpoint
app.get('/', (req, res) => {
  res.json({ message: 'AQIS Backend Server is running.' });
});

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Database connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aqis';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      // Start Pune Live Simulation
      simulationService.startSimulation(io);
    });
  })
  .catch((error) => {
    console.error('CRITICAL: MongoDB connection error. Check MONGO_URI environment variable:', error.message);
    process.exit(1);
  });
