const Message = require('../models/Message');

// GET /api/chat/general & /api/social/messages/general
exports.getGeneralMessages = async (req, res) => {
  try {
    const messages = await Message.find({ channel: 'general' }).sort({ timestamp: 1 }).limit(100);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/chat/division/:divId & /api/social/messages/division
exports.getDivisionMessages = async (req, res) => {
  try {
    const division = (req.params.divId || req.query.division || req.user?.division || 'A').toUpperCase();
    const messages = await Message.find({ channel: 'division', division }).sort({ timestamp: 1 }).limit(100);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/social/messages
exports.postMessage = async (req, res) => {
  try {
    const { content, channel, division, sender_id, sender_name } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });

    const message = await Message.create({
      content,
      channel: channel || 'general',
      division: (division || req.user?.division || 'A').toUpperCase(),
      sender: req.user?._id || (typeof sender_id === 'string' && sender_id.length === 24 ? sender_id : null),
      sender_name: req.user?.name || sender_name || 'Krish Patel'
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
