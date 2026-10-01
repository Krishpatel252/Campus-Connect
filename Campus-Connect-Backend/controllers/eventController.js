const Event = require('../models/Event');

// GET /api/events (open to all authenticated users & frontend)
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      order: [['date', 'ASC']]
    });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/events (CR only)
exports.createEvent = async (req, res) => {
  try {
    const { title, date, description, department } = req.body;
    if (!title || !date) {
      return res.status(400).json({ message: 'Title and date are required' });
    }

    const event = await Event.create({
      title,
      date,
      description: description || 'Added via portal',
      department: department || req.user?.department || 'Information Technology',
      created_by: req.user?.id || req.user?._id || null
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
