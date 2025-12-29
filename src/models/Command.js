const mongoose = require("mongoose");

const CommandSchema = new mongoose.Schema({
  agent_id: String,
  command: String,
  status: {
    type: String,
    enum: ["pending", "done"],
    default: "pending"
  },
  output: String,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Command", CommandSchema);
