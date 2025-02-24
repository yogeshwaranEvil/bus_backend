// models/Route.js
const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
  {
    origin: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    distance: { type: Number, required: true, min: 1 },
    estimatedTime: { type: String, required: true },
    stops: [{ type: String, trim: true }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Exclude deleted routes from queries
routeSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

module.exports = mongoose.model('Route', routeSchema);
