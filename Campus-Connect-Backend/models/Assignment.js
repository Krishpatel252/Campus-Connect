const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: 'Added via portal' },
  due_date: { type: Date, required: true },
  department: { type: String, default: 'Information Technology' },
  division: { type: String, uppercase: true, default: 'A' },
  professor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false 
  }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
