const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
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

  duration: {
    type: Number, // months
    required: true
  },

  total_amount: {
    type: Number,
    required: true
  },

  transaction_uuid: {
    type: String
  },

  payment_method: {
    type: String,
    default: 'eSewa'
  },

  status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  }

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);  