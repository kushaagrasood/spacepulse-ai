const express = require("express");
const router = express.Router();

const SpaceEvent = require("../models/SpaceEvent");

router.get("/", async (req, res) => {
  try {
    const history = await SpaceEvent
      .find()
      .sort({ timestamp: -1 })
      .limit(20);

    res.json(history);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;