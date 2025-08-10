const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['alert', 'info'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  junction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Junction'
  },
  resolved: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', EventSchema);

