const express = require("express");
const router = express.Router();
const askAI = require("../services/aiService");

/*
 POST /api/assistant
 Body: { message: "text" }
*/
router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const reply = await askAI(message);
    res.json({ reply });
  } catch (error) {
    console.error("AI Assistant Error:", error.message);
    res.status(500).json({ error: "AI Assistant failed" });
  }
});

module.exports = router;
