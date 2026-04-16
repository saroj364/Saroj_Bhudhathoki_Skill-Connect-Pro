const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  progressPoint: {
    type: Number,
    default: 0 
  }
}, {
  timestamps: true
});

const Module = mongoose.model('Module', moduleSchema);

module.exports = Module;