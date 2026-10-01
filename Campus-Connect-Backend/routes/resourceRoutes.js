const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const multer = require('multer');
const path = require('path');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure an 'uploads' folder exists in your root directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Get all resources
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT r.*, u.name as uploaded_by_name 
            FROM resources r 
            JOIN users u ON r.uploaded_by = u.id 
            ORDER BY r.timestamp DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload a resource (PDF, etc.)
router.post('/', upload.single('file'), async (req, res) => {
    const { title, uploaded_by } = req.body;
    const file_path = req.file ? `/uploads/${req.file.filename}` : null;

    if (!file_path) return res.status(400).json({ message: 'File upload failed' });

    try {
        const [result] = await pool.query(
            'INSERT INTO resources (title, file_path, uploaded_by) VALUES (?, ?, ?)',
            [title, file_path, uploaded_by]
        );
        res.status(201).json({ id: result.insertId, title, file_path });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;