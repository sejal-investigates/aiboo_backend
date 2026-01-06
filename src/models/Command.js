const mongoose = require("mongoose");

const CommandSchema = new mongoose.Schema({
  agent_id: String,
  command: String,
  status: {
    type: String,
    enum: ["pending", "done"],
    default: "pending"
  },
  exit_code: { type: Number },  // ← ADD THIS
  output: { type: String },     // ← Already have but confirm
  created_at: { type: Date, default: Date.now },
  completed_at: { type: Date }  // ← ADD THIS
});

module.exports = mongoose.model("Command", CommandSchema);