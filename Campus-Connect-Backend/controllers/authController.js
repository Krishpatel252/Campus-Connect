const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'campusconnect_super_secret_jwt_key_2026', { expiresIn: '7d' });
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, enrollment, role, department, division } = req.body;
    
    if (!name || (!email && !enrollment)) {
      return res.status(400).json({ message: 'Name and email/enrollment are required' });
    }

    // Default email if not provided for students
    const userEmail = email || `${(enrollment || name).replace(/\s+/g, '').toLowerCase()}@campus.edu`;
    const userPassword = password || enrollment || 'Student@123';

    const existing = await User.findOne({
      where: enrollment ? { enrollment } : { email: userEmail }
    });
    if (existing) {
      return res.status(400).json({ message: 'User with this email or enrollment already exists' });
    }

    const user = await User.create({
      name,
      email: userEmail,
      enrollment: enrollment || null,
      password: userPassword,
      role: role ? role.toLowerCase() : 'student',
      department: department || 'Information Technology',
      division: division ? division.toUpperCase() : 'A'
    });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      division: user.division,
      token: generateToken(user.id)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { role, email, password, name, enrollment } = req.body;
    const selectedRole = role ? role.toLowerCase() : 'student';

    let user;

    if (selectedRole === 'professor') {
      // Professor login requires email & password
      if (!email || !password) {
        return res.status(400).json({ message: 'Professor login requires email and password' });
      }

      user = await User.findOne({ where: { email } });
      if (!user || user.role !== 'professor') {
        return res.status(401).json({ message: 'No Professor account found with this email' });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } else if (selectedRole === 'student' || selectedRole === 'cr') {
      // Student and CR login with Name and Enrollment
      if (!name || !enrollment) {
        return res.status(400).json({ message: 'Name and Enrollment number are required for Student/CR login' });
      }

      const trimmedName = name.trim();
      const trimmedEnrollment = enrollment.trim();

      user = await User.findOne({
        where: {
          enrollment: trimmedEnrollment
        }
      });

      if (!user) {
        return res.status(401).json({ message: `No student record found with Enrollment: ${trimmedEnrollment}` });
      }

      // Check name match case-insensitively
      if (user.name.toLowerCase().trim() !== trimmedName.toLowerCase()) {
        return res.status(401).json({ message: 'Name does not match the enrolled record' });
      }

      // Check role condition
      if (selectedRole === 'cr' && user.role !== 'cr') {
        return res.status(403).json({ message: 'Access denied: You are not assigned as a Class Representative (CR)' });
      }

      if (selectedRole === 'student' && user.role !== 'student' && user.role !== 'cr') {
        return res.status(403).json({ message: 'Account role mismatch' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid role specified for login' });
    }

    res.json({
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      enrollment: user.enrollment,
      role: user.role,
      department: user.department,
      division: user.division,
      token: generateToken(user.id)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
