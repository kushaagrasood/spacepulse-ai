const express = require("express");
const router = express.Router();
const { fetchLocalWeather } = require("../backend/src/services/weatherService");

router.get("/", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const latitude = parseFloat(lat) || 22.3;
    const longitude = parseFloat(lon) || 70.7;
    const weather = await fetchLocalWeather(latitude, longitude);
    res.json(weather);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;