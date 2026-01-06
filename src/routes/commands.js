const express = require("express");
const router = express.Router();
const Command = require("../models/Command");

// agent polls for commands
router.get("/:agent_id", async (req, res) => {
  const cmds = await Command.find({
    agent_id: req.params.agent_id,
    status: "pending"
  });
  
  // Map 'command' to 'payload' for agent
  res.json(cmds.map(cmd => ({
    _id: cmd._id,
    agent_id: cmd.agent_id,
    payload: cmd.command,  // ← 'command' becomes 'payload'
    status: cmd.status
  })));
});

// agent reports result - FIX THIS!
router.post("/result/:id", async (req, res) => {
  const { exit_code, output } = req.body;  // ← EXTRACT from body
  
  await Command.findByIdAndUpdate(req.params.id, {
    status: "done",
    exit_code: exit_code,      // ← Save exit_code
    output: output,            // ← Save output (NOT result: req.body)
    completed_at: new Date()   // ← Save completion time
  });
  
  res.json({ ok: true });
});

module.exports = router;