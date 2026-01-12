const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema({
  agent_id: { 
    type: String, 
    required: true, 
    index: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now, 
    index: true 
  },
  
  // Hardware
  hardware: mongoose.Schema.Types.Mixed,
  
  // Software
  software: mongoose.Schema.Types.Mixed,
  
  // Network
  network: mongoose.Schema.Types.Mixed,
  
  // System Configuration
  configuration: mongoose.Schema.Types.Mixed,
  
  // Security Assessment
  security: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Create indexes for better performance
InventorySchema.index({ agent_id: 1, timestamp: -1 });

module.exports = mongoose.model("Inventory", InventorySchema);