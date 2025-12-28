const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  agent_id: { type: String, required: true },
  type: { type: String, required: true },
  payload: { type: Object, required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Event", EventSchema);
