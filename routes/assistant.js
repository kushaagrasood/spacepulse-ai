const express = require("express");
const router = express.Router();

const {
  getAssistantReply
} = require("../backend/src/services/aiService");

router.post("/", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        error: "question is required"
      });
    }

    const result = await getAssistantReply([
      {
        role: "user",
        content: question
      }
    ]);

    return res.json({
      reply: result.answer,
      suggestions: result.suggestions
    });

  } catch (err) {

    console.error("Assistant Error:", err);

    return res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;