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
    batch_size: 5,
    batch_timeout_seconds: 15,
    command_poll_interval_seconds: 20
  });
};
