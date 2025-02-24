
// routes/busRoutes.js
const express = require('express');
const { addBus, updateBus, searchBuses, getAllBuses } = require('../controllers/busController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// Admin routes
router.post('/add', authenticateToken, authorizeRoles('admin'), addBus);
router.put('/update/:id', authenticateToken, authorizeRoles('admin'), updateBus);

// User routes
router.get('/search', authenticateToken, authorizeRoles('user', 'admin'), searchBuses);
router.get('/all', authenticateToken, authorizeRoles('user', 'admin'), getAllBuses);

module.exports = router;
