const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false
  },
  sender_name: { type: String, default: 'User' },
  channel: { 
    type: String, 
    enum: ['general', 'division'], 
    default: 'general' 
  },
  department: { type: String, default: 'Information Technology' },
  division: { type: String, uppercase: true, default: 'A' },
  content: { type: String, required: true, trim: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
