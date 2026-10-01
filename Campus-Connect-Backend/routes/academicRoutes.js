const express = require('express');
const router = express.Router();
const { getClasses, getPendingAssignments, getAllAssignments, createAssignment } = require('../controllers/academicController');
const { optionalProtect, authorize } = require('../middleware/authMiddleware');

// GET /api/academics/classes
router.get('/classes', optionalProtect, getClasses);

// GET /api/academics/assignments/pending
router.get('/assignments/pending', optionalProtect, getPendingAssignments);

// GET /api/academics/assignments (frontend compatibility)
router.get('/assignments', optionalProtect, getAllAssignments);

// POST /api/academics/assignments (Professors only)
router.post('/assignments', optionalProtect, authorize('professor'), createAssignment);

module.exports = router;