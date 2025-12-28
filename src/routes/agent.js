const Event = require("../models/Event");

const express = require("express");
const router = express.Router();
const crypto = require("crypto"); // ✅ MISSING IMPORT (CRITICAL)
const Agent = require("../models/Agent");

/**
 * AGENT ENROLL
 */
router.post("/enroll", async (req, res) => {
  try {
    const { hostname } = req.body;

    if (!hostname) {
      return res.status(400).json({ error: "hostname required" });
    }

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
  console.error("Ingest error FULL:", err);
  res.status(500).json({
    error: "ingest failed",
    details: err.message
  });
}

});

/**
 * AGENT HEARTBEAT
 */
router.post("/heartbeat", async (req, res) => {
  try {
    const { agent_id } = req.body;

    if (!agent_id) {
      return res.status(400).json({ error: "agent_id required" });
    }

    await Agent.findOneAndUpdate(
      { agent_id },
      {
        last_seen: new Date(),
        status: "online"
      },
      { upsert: true } // ✅ IMPORTANT
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("Heartbeat error:", err);
    res.status(500).json({ error: "heartbeat failed" });
  }
});
/**
 * AGENT INGEST (telemetry events)
 */
router.post("/ingest", async (req, res) => {
  try {
    const { agent_id, events } = req.body;

    if (!agent_id || !Array.isArray(events)) {
      return res.status(400).json({ error: "invalid payload" });
    }

    // Store events
    const docs = events.map(e => ({
      agent_id,
      type: e.type,
      payload: e,
      created_at: new Date()
    }));

    if (docs.length > 0) {
      await Event.insertMany(docs);
    }

    // Update agent last_seen
    await Agent.findOneAndUpdate(
      { agent_id },
      { last_seen: new Date(), status: "online" },
      { upsert: true }
    );

    res.json({ ok: true, received: docs.length });
  } catch (err) {
    console.error("Ingest error:", err);
    res.status(500).json({ error: "ingest failed" });
  }
});

module.exports = router;
