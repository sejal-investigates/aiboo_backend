const { v4: uuidv4 } = require("uuid");
const Agent = require("../models/Agent");

exports.enroll = async (req, res) => {
  const { hostname } = req.body;

  if (!hostname) {
    return res.status(400).json({ error: "hostname required" });
  }

  let agent = await Agent.findOne({ hostname });

  if (!agent) {
    agent = await Agent.create({
      agentId: uuidv4(),
      hostname
    });
  }

  agent.lastSeen = new Date();
  await agent.save();

  res.json({
    agent_id: agent.agentId,
    batch_size: 10,  // ← Match your config: 10 (not 5)
    batch_timeout_seconds: 60,  // ← Match: 60 (not 15)
    command_poll_interval_seconds: 30  // ← Match: 30 (not 20)
  });
};