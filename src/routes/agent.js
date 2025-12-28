const express = require("express");
const router = express.Router();
const Agent = require("../models/Agent");

router.post("/enroll", async (req, res) => {
  const { hostname } = req.body;

  const agent = await Agent.create({
    agent_id: crypto.randomUUID(),
    hostname
  });

  res.json({
    agent_id: agent.agent_id,
    batch_size: 5,
    batch_timeout_seconds: 15,
    command_poll_interval_seconds: 20
  });
});
router.post("/heartbeat", async (req, res) => {
  const { agent_id } = req.body;

  await Agent.findOneAndUpdate(
    { agent_id },
    { last_seen: new Date(), status: "online" }
  );

  res.json({ ok: true });
});

module.exports = router;
