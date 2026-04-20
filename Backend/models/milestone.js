const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema({
  gig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },

  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
  },

  amount: {
    type: Number,
    required: true,
  },

  deadline: {
    type: Date,
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "in-progress", "completed", "approved"],
    default: "pending",
  },

  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid"],
    default: "unpaid",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Milestone", milestoneSchema);