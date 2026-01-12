const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  agent_id: { type: String, index: true },
  type: { type: String, index: true }, // "Heartbeat", "ProcessSnapshot", "InventorySnapshot", etc.
  data: mongoose.Schema.Types.Mixed, // The full event data
  timestamp: { type: Date, default: Date.now, index: true },
  
  // Your existing fields
  name: String,
  rawData: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model("Event", EventSchema);