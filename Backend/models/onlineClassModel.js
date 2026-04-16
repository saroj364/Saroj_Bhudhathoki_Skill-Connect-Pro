const mongoose = require('mongoose');

const onlineClassSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  module_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  instructor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  users_joined: [
    {
      user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      joined_at: { type: Date, default: Date.now }
    }
  ],
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed'],
    default: 'scheduled'
  },
  url: {
    type: String,
    required: true 
  },
  start_time: { type: Date },
  end_time: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('OnlineClass', onlineClassSchema);