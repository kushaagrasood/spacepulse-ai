const express = require("express");
const router = express.Router();
const { getImpact } = require("../backend/src/services/impactEngine");
const Observation = require("../models/Observation");

router.post("/", async (req, res) => {
  try {
    const { profession, event, severity, user_id } = req.body;
    const result = await getImpact(profession, event, severity);
    if (user_id) {
      await Observation.create({
        user_id,
        event,
        impact_score: result.impactScore,
      });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;