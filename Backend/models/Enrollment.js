const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  status: {
    type: Boolean,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },

  expires_at: {
    type: Date,
    required: true
  },
  progress: {
    type: Number,
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);