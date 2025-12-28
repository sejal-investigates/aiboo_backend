const mongoose = require("mongoose");

// Define structure of an Event
const EventSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Event name (text)
  timestamp: { type: Date, default: Date.now }, // Time of event
  rawData: { type: Object } // Extra data (JSON object)
});

// Export model to use in other files
module.exports = mongoose.model("Event", EventSchema);
