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
  console.log("📥 Request body:", req.body);  // ← Should now show JSON!
  
  // Check if body exists
  if (!req.body) {
    console.error("❌ req.body is undefined!");
    return res.status(400).json({ error: "No request body" });
  }
  
  const { exit_code, output } = req.body;
  
  if (exit_code === undefined || output === undefined) {
    console.error("❌ Missing fields in body:", req.body);
    return res.status(400).json({ 
      error: "Missing exit_code or output", 
      received: req.body 
    });
  }
  
  try {
    await Command.findByIdAndUpdate(req.params.id, {
      status: "done",
      exit_code: exit_code,
      output: output,
      completed_at: new Date()
    });
    
    console.log("✅ Result saved successfully");
    res.json({ ok: true });
    
  } catch (error) {
    console.error("❌ Database error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;