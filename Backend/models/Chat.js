const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({

  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job"
  },
  class:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OnlineClass'
  },

  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model("Chat", chatSchema);