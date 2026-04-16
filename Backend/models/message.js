const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chat: mongoose.Schema.Types.ObjectId,
  sender: mongoose.Schema.Types.ObjectId,

  message: String, // normal text
  type: {
    type: String,
    enum: ["text","hire-request"],
    default: "text"
  },
  

  payload: Object, // for hire request

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  }
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);