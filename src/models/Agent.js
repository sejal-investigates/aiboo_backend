const mongoose = require("mongoose");

const AgentSchema = new mongoose.Schema({
  agent_id: { type: String, required: true, unique: true },
  hostname: String,
  first_seen: { type: Date, default: Date.now },
  last_seen: { type: Date, default: Date.now },
  status: { type: String, default: "online" }
});

module.exports = mongoose.model("Agent", AgentSchema);
