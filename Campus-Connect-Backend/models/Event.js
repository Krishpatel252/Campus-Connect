const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  description: { type: String, default: 'Added via portal' },
  department: { type: String, default: 'Information Technology' },
  created_by: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
