// models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
    seatsBooked: { type: Number, required: true, min: 1 },
    bookingDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['booked', 'cancelled'], default: 'booked' },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Prevent booking more seats than available
bookingSchema.pre('save', async function (next) {
  const bus = await mongoose.model('Bus').findById(this.bus);
  if (!bus) return next(new Error('Bus not found.'));
  if (bus.availableSeats < this.seatsBooked) {
    return next(new Error('Not enough available seats.'));
  }
  next();
});

// Exclude deleted bookings from queries
bookingSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
