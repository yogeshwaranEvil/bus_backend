const Route = require('../models/Route');

// Admin: Add a new route

// Admin: Add a new route
exports.addRoute = async (req, res) => {
  const { origin, destination, stops = [], distance, estimatedTime } = req.body;

  try {
    if (!estimatedTime) {
      return res.status(400).json({ message: 'estimatedTime is required.' });
    }

    const existingRoute = await Route.findOne({ origin, destination });
    if (existingRoute) {
      return res.status(400).json({ message: 'A route between these locations already exists.' });
    }

    const newRoute = new Route({ origin, destination, stops, distance, estimatedTime });
    await newRoute.save();

    res.status(201).json({ message: 'Route added successfully.', route: newRoute });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add route.', error: error.message });
  }
};


// Admin: Update existing route details
exports.updateRoute = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    // Validate if the provided ID is a valid ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid route ID format.' });
    }

    // Check for required fields if they are being updated
    if ('estimatedTime' in updates && !updates.estimatedTime) {
      return res.status(400).json({ message: 'estimatedTime cannot be empty if provided.' });
    }

    const updatedRoute = await Route.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    
    if (!updatedRoute) {
      return res.status(404).json({ message: 'Route not found. Please check the ID.' });
    }

    res.status(200).json({ message: 'Route updated successfully.', route: updatedRoute });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update route.', error: error.message });
  }
};


// User & Admin: Search for routes
exports.searchRoutes = async (req, res) => {
  const { origin, destination } = req.query;

  try {
    if (!origin || !destination) {
      return res.status(400).json({ message: 'Origin and destination are required for searching routes.' });
    }

    const routes = await Route.find({ origin, destination });
    if (!routes.length) {
      return res.status(404).json({ message: 'No routes found for the given locations.' });
    }

    res.status(200).json({ routes });
  } catch (error) {
    res.status(500).json({ message: 'Failed to search routes.', error: error.message });
  }
};

// Admin & User: Get all routes
exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find();
    if (!routes.length) {
      return res.status(404).json({ message: 'No routes available at the moment.' });
    }
    res.status(200).json({ routes });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch routes.', error: error.message });
  }
};
