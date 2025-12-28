const mongoose = require("mongoose");

const AgentSchema = new mongoose.Schema({
  agentId: { type: String, unique: true },
  hostname: String,
  firstSeen: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Agent", AgentSchema);
