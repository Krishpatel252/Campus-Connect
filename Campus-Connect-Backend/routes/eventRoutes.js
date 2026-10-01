const express = require('express');
const router = express.Router();
const { getEvents, createEvent } = require('../controllers/eventController');
const { optionalProtect, authorize } = require('../middleware/authMiddleware');

// GET /api/events (open to all authenticated/guest users)
router.get('/', optionalProtect, getEvents);

// POST /api/events (CR only)
router.post('/', optionalProtect, authorize('cr'), createEvent);

module.exports = router;