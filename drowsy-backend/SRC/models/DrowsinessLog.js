const mongoose = require("mongoose");

const drowsyLogSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },

    ear: Number,
    mar: Number,
    tilt: Number,
    score: Number,

    isDrowsy: {
      type: Boolean,
      default: false,
    },

    alertTriggered: {
      type: Boolean,
      default: false,
    },

    alertType: {
      type: String,
      enum: ["drowsy", "yawn", "head_tilt", null],
      default: null,
    },

    status: {
      type: String,
      enum: ["Safe", "Warning", "Danger", null],
      default: "Safe"
    },

    gps: {
      lat: Number,
      lng: Number
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DrowsyLog", drowsyLogSchema);
