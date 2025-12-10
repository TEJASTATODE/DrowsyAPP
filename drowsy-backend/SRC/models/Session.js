const mongoose = require("mongoose");

const gpsPointSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  speed: Number,
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
sessionId: {
      type: String,
      required: false,
      
    },
    startTime: {
      type: Date,
      default: Date.now,
    },

    endTime: {
      type: Date,
    },

    duration: { type: Number, default: 0 }, 

    avgEar: { type: Number, default: 0 }, 
    avgMar: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    
    drowsyCount: { 
      type: Number, 
      default: 0,
    },

    status: { 
      type: String, 
      default: "Safe" 
    },
   

    alerts: [
      {
        type: Date,
      }
    ],

    gpsHistory: [gpsPointSchema],

   
    metrics: {
      avgEAR: Number,
      avgMAR: Number,
      sunglassesOnCount: Number,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);