const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');

// GET /api/users/profile
router.get('/profile', protect, getUserProfile);

// GET /api/users/students - Get all students & CRs (Accessible by Professor)
router.get('/students', protect, authorize('professor'), async (req, res) => {
  try {
    const students = await User.findAll({
      where: {
        role: ['student', 'cr']
      },
      attributes: ['id', 'name', 'email', 'enrollment', 'role', 'department', 'division', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/students - Professor adds a student
router.post('/students', protect, authorize('professor'), async (req, res) => {
  try {
    const { name, enrollment, isCR, department, division } = req.body;

    if (!name || !enrollment) {
      return res.status(400).json({ message: 'Student Name and Enrollment Number are required' });
    }

    const trimmedName = name.trim();
    const trimmedEnrollment = enrollment.trim();

    // Check if enrollment already exists
    const existing = await User.findOne({ where: { enrollment: trimmedEnrollment } });
    if (existing) {
      return res.status(400).json({ message: `Student with enrollment '${trimmedEnrollment}' already exists` });
    }

    const userEmail = `${trimmedEnrollment.toLowerCase()}@campus.edu`;
    const assignedRole = isCR ? 'cr' : 'student';

    const newStudent = await User.create({
      name: trimmedName,
      enrollment: trimmedEnrollment,
      email: userEmail,
      password: trimmedEnrollment, // Password defaults to enrollment number for seamless student login
      role: assignedRole,
      department: department || req.user.department || 'Information Technology',
      division: division || req.user.division || 'A'
    });

    res.status(201).json({
      message: `Student '${trimmedName}' added successfully as ${assignedRole.toUpperCase()}`,
      student: {
        id: newStudent.id,
        name: newStudent.name,
        enrollment: newStudent.enrollment,
        email: newStudent.email,
        role: newStudent.role,
        department: newStudent.department,
        division: newStudent.division
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/students/:id/toggle-cr - Professor toggles Student <-> CR role
router.patch('/students/:id/toggle-cr', protect, authorize('professor'), async (req, res) => {
  try {
    const student = await User.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.role !== 'student' && student.role !== 'cr') {
      return res.status(400).json({ message: 'Only students can be toggled to/from CR' });
    }

    // Toggle role
    const newRole = student.role === 'student' ? 'cr' : 'student';
    student.role = newRole;
    await student.save();

    res.json({
      message: `Updated ${student.name}'s role to ${newRole.toUpperCase()}`,
      student: {
        id: student.id,
        name: student.name,
        enrollment: student.enrollment,
        email: student.email,
        role: student.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/students/:id - Professor edits student details (name, enrollment, division)
router.put('/students/:id', protect, authorize('professor'), async (req, res) => {
  try {
    const { name, enrollment, division } = req.body;
    const student = await User.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.role !== 'student' && student.role !== 'cr') {
      return res.status(400).json({ message: 'Only students or CRs can be edited here' });
    }

    if (name) {
      student.name = name.trim();
    }

    if (enrollment) {
      const trimmedEnrollment = enrollment.trim();
      // Check if new enrollment is already in use by another user
      if (trimmedEnrollment !== student.enrollment) {
        const existing = await User.findOne({ where: { enrollment: trimmedEnrollment } });
        if (existing && existing.id !== student.id) {
          return res.status(400).json({ message: `Enrollment '${trimmedEnrollment}' is already assigned to another user` });
        }
        student.enrollment = trimmedEnrollment;
        student.email = `${trimmedEnrollment.toLowerCase()}@campus.edu`;
      }
    }

    if (division) {
      student.division = division.trim().toUpperCase();
    }

    await student.save();

    res.json({
      message: 'Student details updated successfully',
      student: {
        id: student.id,
        name: student.name,
        enrollment: student.enrollment,
        email: student.email,
        role: student.role,
        department: student.department,
        division: student.division
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Compatibility route: GET /api/users/:userId
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId, {
      attributes: { exclude: ['password'] }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
