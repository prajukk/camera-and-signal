const mongoose = require('mongoose');

const trafficLightSchema = new mongoose.Schema({
  direction: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['red', 'yellow', 'green'],
    required: true
  },
  status: {
    type: String,
    enum: ['operational', 'faulty'],
    default: 'operational'
  }
});

const junctionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: String,
  trafficLights: [trafficLightSchema],
  trafficFlow: {
    type: String,
    enum: ['Low', 'Moderate', 'Heavy'],
    default: 'Low'
  }
});

module.exports = mongoose.model('Junction', junctionSchema);
