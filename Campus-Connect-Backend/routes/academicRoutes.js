const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all assignments
router.get('/assignments', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM assignments ORDER BY due_date ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Professor adding an assignment
router.post('/assignments', async (req, res) => {
    const { title, description, due_date, professor_id } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO assignments (title, description, due_date, professor_id) VALUES (?, ?, ?, ?)',
            [title, description, due_date, professor_id]
        );
        res.status(201).json({ id: result.insertId, title, description, due_date });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;