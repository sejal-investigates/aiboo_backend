const express = require("express");
const router = express.Router();
const Command = require("../models/Command");

// agent polls for commands
router.get("/:agent_id", async (req, res) => {
  const cmds = await Command.find({
    agent_id: req.params.agent_id,
    status: "pending"
  });
  res.json(cmds);
});

// agent reports result
router.post("/result/:id", async (req, res) => {
  await Command.findByIdAndUpdate(req.params.id, {
    status: "done",
    result: req.body
  });
  res.json({ ok: true });
});

module.exports = router;
