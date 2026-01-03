const express = require("express");
const router = express.Router();
const crypto = require("crypto");

const Agent = require("../models/Agent");
const Command = require("../models/Command");

/* ================== ENROLL ================== */
router.post("/enroll", async (req, res) => {
  try {
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
  } catch (err) {
    console.error("Enroll error:", err);
    res.status(500).json({ error: "enroll failed", details: err.message });
  }
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

/* ================== TELEMETRY INGEST ================== */
router.post("/ingest", async (req, res) => {
  const { agent_id, events } = req.body;
  
  if (!agent_id || !events || !Array.isArray(events)) {
    return res.status(400).json({ error: "agent_id and events[] required" });
  }

  // Update agent last_seen
  await Agent.findOneAndUpdate(
    { agent_id },
    { last_seen: new Date(), status: "online" }
  );

  // Save events (you need Event model for this)
  // await Event.insertMany(events.map(event => ({ ...event, agent_id })));
  
  res.json({ ok: true, received: events.length });
});

/* ================== COMMAND POLL (FIXED) ================== */
router.get("/command/:agent_id", async (req, res) => {
  try {
    const agent = await Agent.findOne({ agent_id: req.params.agent_id });
    if (!agent) return res.status(404).json({ error: "Agent not found" });

    const cmd = await Command.findOneAndUpdate(
      {
        agent_id: req.params.agent_id,
        status: "pending"
      },
      {
        status: "dispatched",
        dispatched_at: new Date()
      },
      {
        sort: { created_at: 1 },
        new: true
      }
    );

    if (!cmd) {
      return res.json({});  // ← EMPTY JSON (no crash!)
    }

    res.json({
      command_id: cmd._id.toString(),
      payload: cmd.payload  // ← Use "payload" instead of "command"
    });
  } catch (err) {
    console.error("Command poll error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================== COMMAND RESULT (FIXED) ================== */
router.post("/command/:agent_id/result", async (req, res) => {
  try {
    const { command_id, output, status } = req.body;
    
    if (!command_id) return res.status(400).json({ error: "command_id required" });

    await Command.findByIdAndUpdate(command_id, {
      status: status || "completed",
      output: output,
      completed_at: new Date()
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Command result error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
