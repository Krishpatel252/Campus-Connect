const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// GET /api/users/profile
router.get('/profile', protect, getUserProfile);

// Compatibility route: GET /api/users/:userId or /api/dashboard/:userId
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
