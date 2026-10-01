const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Campus Connect API is running' });
});

// Placeholder for future routes (we will add these one by one)
// app.use('/api/users', require('./routes/userRoutes'));
// app.use('/api/academics', require('./routes/academicRoutes'));
// app.use('/api/events', require('./routes/eventRoutes'));
// app.use('/api/resources', require('./routes/resourceRoutes'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});