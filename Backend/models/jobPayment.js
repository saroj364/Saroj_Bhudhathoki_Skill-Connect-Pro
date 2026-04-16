// models/JobPayment.js
const mongoose = require("mongoose");

const jobPaymentSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },

  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  transaction_uuid: {
    type: String,
    required: true,
    unique: true,
  },

  status: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },

  payment_method: {
    type: String,
    default: "esewa",
  },

}, { timestamps: true });

module.exports = mongoose.model("JobPayment", jobPaymentSchema);