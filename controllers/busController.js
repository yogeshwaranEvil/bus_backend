// controllers/busController.js
const Bus = require('../models/Bus');
const Route = require('../models/Route');

// Admin: Add a new bus
exports.addBus = async (req, res) => {
  const { busNumber, capacity, route, departureTime, arrivalTime, price, availableSeats, operator } = req.body;

  try {
    const existingBus = await Bus.findOne({ busNumber });
    if (existingBus) return res.status(400).json({ message: 'Bus number already exists.' });

    const newBus = new Bus({ busNumber, capacity, route, departureTime, arrivalTime, price, availableSeats, operator });
    await newBus.save();

    res.status(201).json({ message: 'Bus added successfully.', bus: newBus });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add bus.', error: error.message });
  }
};

// Admin: Update bus details
exports.updateBus = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid bus ID.' });
    }

    const updatedBus = await Bus.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updatedBus) return res.status(404).json({ message: 'Bus not found.' });

    res.status(200).json({ message: 'Bus updated successfully.', bus: updatedBus });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update bus.', error: error.message });
  }
};

// User: View available buses based on search criteria
exports.searchBuses = async (req, res) => {
  const { origin, destination } = req.query;

  try {
    // Validate query parameters
    if (!origin || !destination) {
      return res.status(400).json({ message: 'Origin and destination are required.' });
    }

    // Find routes matching origin and destination
    const routes = await Route.find({ origin: origin.trim(), destination: destination.trim() });
    if (!routes.length) {
      return res.status(404).json({ message: 'No routes found for the given locations.' });
    }

    const routeIds = routes.map((route) => route._id);

    // Find available buses for the matched routes
    const buses = await Bus.find({
      route: { $in: routeIds },
      isDeleted: false
    }).populate('route', 'origin destination distance estimatedTime');

    if (!buses.length) {
      return res.status(404).json({ message: 'No available buses found for the selected route.' });
    }

    res.status(200).json({ buses });
  } catch (error) {
    res.status(500).json({ message: 'Failed to search buses.', error: error.message });
  }
};



// Admin & User: View all buses
exports.getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.find().populate('route');
    res.status(200).json({ buses });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch buses.', error: error.message });
  }
};
