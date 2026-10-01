const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get user personal details
router.get('/:userId', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, email, role, department, division FROM users WHERE id = ?', [req.params.userId]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;