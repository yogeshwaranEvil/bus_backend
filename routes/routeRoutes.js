const express = require('express');
const {
  addRoute,
  updateRoute,
  searchRoutes,
  getAllRoutes
} = require('../controllers/routeController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// ✅ Admin routes
router.post('/add', authenticateToken, authorizeRoles('admin'), addRoute);      // Add a new route
router.put('/update/:id', authenticateToken, authorizeRoles('admin'), updateRoute); // Update existing route

// ✅ User & Admin routes
router.get('/search', authenticateToken, authorizeRoles('user', 'admin'), searchRoutes); // Search routes
router.get('/all', authenticateToken, authorizeRoles('user', 'admin'), getAllRoutes);    // Get all routes

module.exports = router;
