const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
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

  title: {
    type: String,
    required: true,
  },

  description: String,

  hours: Number,

  workType: String,

  budget: Number,

  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
  },

  requestStatus: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },

  status: {
    type: String,
    enum: ["not-started", "in-progress", "completed"],
    default: "not-started",
  },

  completedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model("Job", jobSchema);