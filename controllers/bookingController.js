const Booking = require('../models/Booking');
const Bus = require('../models/Bus');
exports.bookBus = async (req, res) => {
  try {
    const { busId, seatNumber } = req.body;
    const userId = req.user.id; // Extracted from token via authenticateToken middleware

    // ✅ Check if bus exists
    const bus = await Bus.findById(busId);
    if (!bus) return res.status(404).json({ message: 'Bus not found.' });

    // 🚫 Check if the seat is already booked
    if (bus.bookedSeats.includes(seatNumber)) {
      return res.status(400).json({ message: 'Seat already booked.' });
    }

    // ✅ Book the seat
    bus.bookedSeats.push(seatNumber);
    bus.availableSeats -= 1; // Decrease available seats
    await bus.save();

    // 📝 Create booking record
    const booking = await Booking.create({
      user: userId,
      bus: busId,
      seatsBooked: 1, // Assuming one seat per booking
      bookingDate: new Date()
    });

    res.status(201).json({ message: 'Booking successful.', booking });
  } catch (error) {
    res.status(500).json({ message: 'Booking failed.', error: error.message });
  }
};


// ❌ User: Cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    // 🔎 Find and delete booking
    const booking = await Booking.findOneAndDelete({ _id: bookingId, userId });
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    // 🪑 Free up the seat
    await Bus.findByIdAndUpdate(booking.busId, {
      $pull: { bookedSeats: booking.seatNumber }
    });

    res.status(200).json({ message: 'Booking cancelled successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Cancellation failed.', error: error.message });
  }
};

// 👤 User: View their bookings
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('busId', 'busNumber route')
      .sort({ bookingDate: -1 });

    if (!bookings.length) {
      return res.status(404).json({ message: 'No bookings found.' });
    }

    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings.', error: error.message });
  }
};

// 🛡️ Admin: View all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'username email')
      .populate('busId', 'busNumber route')
      .sort({ bookingDate: -1 });

    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch all bookings.', error: error.message });
  }
};
