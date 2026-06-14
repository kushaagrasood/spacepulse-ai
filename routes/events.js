const express = require("express");
const router = express.Router();
const { aggregateEvents } = require("../backend/src/services/aggregateEvents");
const SpaceEvent = require("../models/SpaceEvent");

router.get("/", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    const latitude = parseFloat(lat) || 22.3;
    const longitude = parseFloat(lon) || 70.7;

    const event = await aggregateEvents({
      latitude,
      longitude,
    });

    await SpaceEvent.create({
      event: event.event,
      kpIndex: event.kpIndex,
      severity: event.severity,
      cloudCover: event.weather?.cloudCover || 0,
    });

    return res.json(event);

  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;