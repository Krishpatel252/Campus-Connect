const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  file_path: { type: String, required: true },
  department: { type: String, default: 'Information Technology' },
  subject: { type: String, default: 'General' },
  uploaded_by: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false
  },
  uploaded_by_name: { type: String, default: 'Faculty' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resource', resourceSchema);
