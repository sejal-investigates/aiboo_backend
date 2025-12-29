const express = require("express");
const router = express.Router();
const crypto = require("crypto");

const Agent = require("../models/Agent");
const Command = require("../models/Command");

/* ================== ENROLL ================== */
router.post("/enroll", async (req, res) => {
  const { hostname } = req.body;
  if (!hostname) return res.status(400).json({ error: "hostname required" });

  const agent = await Agent.create({
    agent_id: crypto.randomUUID(),
    hostname,
    status: "online",
    last_seen: new Date()
  });

  res.json({
    agent_id: agent.agent_id,
    batch_size: 5,
    batch_timeout_seconds: 15,
    command_poll_interval_seconds: 20
  });
});

/* ================== HEARTBEAT ================== */
router.post("/heartbeat", async (req, res) => {
  const { agent_id } = req.body;
  await Agent.findOneAndUpdate(
    { agent_id },
    { last_seen: new Date(), status: "online" },
    { upsert: true }
  );
  res.json({ ok: true });
});

/* ================== COMMAND POLL ================== */
router.get("/command/poll/:agent_id", async (req, res) => {
  const cmd = await Command.findOne({
    agent_id: req.params.agent_id,
    status: "pending"
  }).sort({ created_at: 1 });

  if (!cmd) return res.json({ command: null });

  res.json({ command: cmd.command, id: cmd._id });
});

/* ================== COMMAND RESULT ================== */
router.post("/command/result", async (req, res) => {
  const { id, output } = req.body;

  await Command.findByIdAndUpdate(id, {
    status: "done",
    output
  });

  res.json({ ok: true });
});

module.exports = router;
