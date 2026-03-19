const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  batchName: {
    type: String,
    required: [true, 'Batch name is required'],
    trim: true,
    unique: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  startYear: {
    type: Number,
    required: true
  },
  endYear: {
    type: Number,
    required: true
  },
  currentSemester: {
    type: Number,
    default: 1,
    min: 1,
    max: 8
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);
