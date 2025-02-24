const express = require('express');
const {
  bookBus,
  cancelBooking,
  getUserBookings,
  getAllBookings
} = require('../controllers/bookingController');
const {
  authenticateToken,
  authorizeRoles
} = require('../middlewares/authMiddleware');

const router = express.Router();

// User routes
router.post('/book', authenticateToken, authorizeRoles('user '), bookBus);
router.delete('/cancel/:bookingId', authenticateToken, authorizeRoles('user'), cancelBooking);
router.get('/my-bookings', authenticateToken, authorizeRoles('user'), getUserBookings);

// Admin route
router.get('/all', authenticateToken, authorizeRoles('admin'), getAllBookings);

module.exports = router;



// const express = require('express');
// const router = express.Router();

// // Example route
// router.get('/', (req, res) => {
//   res.send('Route is working!');
// });

// module.exports = router; // ✅ This must be exported correctly
