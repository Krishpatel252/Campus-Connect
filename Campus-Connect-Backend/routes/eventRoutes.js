const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all events
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM events ORDER BY date ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CR adding an event
router.post('/', async (req, res) => {
    const { title, date, description, created_by } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO events (title, date, description, created_by) VALUES (?, ?, ?, ?)',
            [title, date, description, created_by]
        );
        res.status(201).json({ id: result.insertId, title, date, description });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;