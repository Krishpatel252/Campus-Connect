const Resource = require('../models/Resource');

// GET /api/resources
exports.getResources = async (req, res) => {
  try {
    const resources = await Resource.findAll({
      order: [['timestamp', 'DESC']]
    });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/resources/upload and /api/resources
exports.uploadResource = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please attach a document file' });
    }

    const { title, subject, department } = req.body;
    const file_path = `/uploads/${req.file.filename}`;

    const resource = await Resource.create({
      title: title || req.file.originalname,
      file_path,
      subject: subject || 'General',
      department: department || req.user?.department || 'Information Technology',
      uploaded_by: req.user?.id || req.user?._id || null,
      uploaded_by_name: req.user?.name || req.body?.uploaded_by_name || 'Faculty'
    });

    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
