const express = require("express");
const router = express.Router();
const { getISSData } = require("../backend/src/services/celestrakService");

router.get("/", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const latitude = parseFloat(lat) || 22.3;
    const longitude = parseFloat(lon) || 70.7;
    const iss = await getISSData(latitude, longitude);
    res.json(iss);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;