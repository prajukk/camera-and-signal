// index.js (or server.js)
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/traffic-db';
console.log('Connecting to MongoDB at:', MONGO_URI);

mongoose.connect(MONGO_URI)
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB error:', err));

// Import routes
const dashboardRoutes = require('./routes/dashboardRoutes');
const junctionRoutes = require('./routes/junctionRoutes');
const authRoutes = require('./routes/authRoutes');

// Use routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/junctions', junctionRoutes);
app.use('/api/auth', authRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
