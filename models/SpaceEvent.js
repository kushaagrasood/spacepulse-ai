const mongoose = require("mongoose");

const SpaceEventSchema = new mongoose.Schema({
  event: String,
  kpIndex: Number,
  severity: Number,
  cloudCover: Number,

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "SpaceEvent",
  SpaceEventSchema
);