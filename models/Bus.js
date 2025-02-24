const mongoose = require('mongoose');

const busSchema = new mongoose.Schema(
  {
    busNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
    capacity: { type: Number, required: true, min: 10, max: 100 },
    operator: { type: String, required: true, trim: true },
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    price: { type: Number, required: true, min: 1 },
    availableSeats: { type: Number, required: true },
    bookedSeats: { type: [Number], default: [] }, // ✅ Added this field
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Ensure availableSeats does not exceed capacity
busSchema.pre('save', function (next) {
  if (this.availableSeats > this.capacity) {
    return next(new Error('Available seats cannot exceed total capacity.'));
  }
  next();
});

// Exclude deleted buses from queries
busSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

module.exports = mongoose.model('Bus', busSchema);
