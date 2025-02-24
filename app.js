const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); // MongoDB connection

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🚀 Connect to MongoDB
connectDB();

// 🔒 Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// 📦 Routes
const authRoutes = require('./routes/authRoutes'); // Authentication (register, login, refresh, logout)
const busRoutes = require('./routes/busRoutes');   // Bus & Route management
const routeRoutes = require('./routes/routeRoutes');
const bookingRoutes = require('./routes/bookingRoutes');


// 🛡️ Apply routes
app.use('/api/auth', authRoutes);  // Example: POST /api/auth/register
app.use('/api/bus', busRoutes);  // Example: POST /api/admin/bus (admin access only)
app.use('/api/route', routeRoutes);
app.use('/api/booking', bookingRoutes);

// 🌐 Base route (optional)
app.get('/', (req, res) => res.send('🚍 Bus Booking System API is running...'));

// 🚀 Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;
