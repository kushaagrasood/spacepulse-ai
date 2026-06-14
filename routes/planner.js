const express = require("express");
const router = express.Router();
const { generateSkyPlan } = require("../backend/src/services/skyPlanner");;

router.post("/", async (req, res) => {
  const { question, location, weather, visibleObjects } = req.body;

  if (!question) {
    return res.status(400).json({ error: "question is required" });
  }

  try {
    const plan = await generateSkyPlan(
      question,
      location || "Unknown location",
      weather || {},
      visibleObjects || []
    );
    res.json(plan);
  } catch (err) {
    console.error("Sky planner error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;