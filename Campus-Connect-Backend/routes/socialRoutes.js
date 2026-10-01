const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get messages for a channel (general or specific division)
router.get('/messages/:channel', async (req, res) => {
    const { channel } = req.params;
    const { division } = req.query; // Pass division as a query param for division chat
    
    try {
        let query = `
            SELECT m.*, u.name as sender_name 
            FROM messages m 
            JOIN users u ON m.sender_id = u.id 
            WHERE m.channel = ?
        `;
        const queryParams = [channel];

        if (channel === 'division' && division) {
            query += ' AND m.division = ?';
            queryParams.push(division);
        }
        
        query += ' ORDER BY m.timestamp ASC';
        
        const [rows] = await pool.query(query, queryParams);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Post a message
router.post('/messages', async (req, res) => {
    const { sender_id, channel, division, content } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO messages (sender_id, channel, division, content) VALUES (?, ?, ?, ?)',
            [sender_id, channel, division || null, content]
        );
        res.status(201).json({ id: result.insertId, message: 'Message sent successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;