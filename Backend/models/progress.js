const mongoose = require('mongoose');

const moduleProgressSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  module_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  progressPoint: {
    type: Number,
    default: 0 
  }
}, {
  timestamps: true
});

moduleProgressSchema.index({ user_id: 1, module_id: 1 }, { unique: true });
const ModuleProgress = mongoose.model('ModuleProgress', moduleProgressSchema);

module.exports = ModuleProgress;