// models/Camera.js
const mongoose = require('mongoose');

const CameraSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  junction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Junction'
  },
  ipAddress: String,
  lastPing: Date
}, { timestamps: true });

// Create a geospatial index for location-based queries
CameraSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Camera', CameraSchema);