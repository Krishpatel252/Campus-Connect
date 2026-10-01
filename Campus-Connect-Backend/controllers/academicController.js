const { Op } = require('sequelize');
const Assignment = require('../models/Assignment');

// Get classes schedule
exports.getClasses = async (req, res) => {
  const department = req.user?.department || 'Information Technology';
  const division = req.user?.division || 'A';
  res.json([
    { id: 1, subject: 'Database Management Systems', code: 'IT301', room: 'Lab 4', time: '10:00 AM - 11:30 AM', department, division },
    { id: 2, subject: 'Web Technologies', code: 'IT302', room: 'LH 2', time: '11:45 AM - 01:15 PM', department, division },
    { id: 3, subject: 'Computer Networks', code: 'IT303', room: 'LH 1', time: '02:00 PM - 03:30 PM', department, division }
  ]);
};

// Pending assignments for the student's class / division
exports.getPendingAssignments = async (req, res) => {
  try {
    const division = (req.user?.division || req.query.division || 'A').toUpperCase();
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const assignments = await Assignment.findAll({
      where: {
        division,
        due_date: {
          [Op.gte]: now
        }
      },
      order: [['due_date', 'ASC']]
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// All assignments (Direct frontend compatibility)
exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.findAll({
      order: [['due_date', 'ASC']]
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create assignment (Professor only)
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, due_date, division, department } = req.body;
    if (!title || !due_date) {
      return res.status(400).json({ message: 'Title and due_date are required' });
    }

    const assignment = await Assignment.create({
      title,
      description: description || 'Added via portal',
      due_date,
      division: (division || req.user?.division || 'A').toUpperCase(),
      department: department || req.user?.department || 'Information Technology',
      professor: req.user?.id || req.user?._id || null
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
