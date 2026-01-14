const Agent = require("../models/Agent");
const Command = require("../models/Command");
const Event = require("../models/Event");
const Inventory = require("../models/Inventory");

/* ================== ENROLL ================== */
exports.enroll = async (req, res) => {
  try {
    const { hostname, ip, os, agent_id } = req.body;
    
    // Create or update agent
    const agent = await Agent.findOneAndUpdate(
      { agent_id },
      {
        hostname,
        ip,
        os,
        last_seen: new Date(),
        status: "online",
        enrolled_at: new Date()
      },
      { upsert: true, new: true }
    );
    
    res.json({
      success: true,
      message: "Agent enrolled successfully",
      agent_id: agent.agent_id
    });
  } catch (error) {
    console.error("Enroll error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ================== HEARTBEAT ================== */
exports.heartbeat = async (req, res) => {
  try {
    const { agent_id, hostname, uptime } = req.body;
    
    // Update agent last seen
    await Agent.findOneAndUpdate(
      { agent_id },
      {
        last_seen: new Date(),
        status: "online",
        hostname,
        uptime
      }
    );
    
    res.json({ success: true, message: "Heartbeat received" });
  } catch (error) {
    console.error("Heartbeat error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ================== TELEMETRY INGEST ================== */
exports.ingest = async (req, res) => {
  try {
    console.log('📥 INGEST: Received telemetry data');
    
    const { agent_id, events } = req.body;
    
    if (!agent_id) {
      return res.status(400).json({ error: 'Missing agent_id' });
    }
    
    if (!events || !Array.isArray(events)) {
      return res.status(400).json({ error: 'Invalid events array' });
    }
    
    console.log(`📊 Processing ${events.length} events from agent: ${agent_id}`);
    
    const eventPromises = [];
    const inventoryPromises = [];
    
    for (const event of events) {
      console.log(`🔍 Event type: ${event.type}`);
      
      const eventWithMeta = {
        ...event,
        agent_id,
        received_at: new Date(),
        processed: false
      };
      
      // Route based on event type
      if (event.type === 'InventorySnapshot') {
        console.log('📦 Saving to inventories collection');
        // Save to Inventory model/collection
        inventoryPromises.push(
          Inventory.create(eventWithMeta)
        );
      } else {
        console.log(`📊 Saving to events collection: ${event.type}`);
        // Save to Event model/collection
        eventPromises.push(
          Event.create(eventWithMeta)
        );
      }
    }
    
    // Execute all database operations
    const results = await Promise.allSettled([
      ...eventPromises,
      ...inventoryPromises
    ]);
    
    // Count successes
    const successfulEvents = results.filter(r => r.status === 'fulfilled').length;
    
    console.log(`✅ Ingest complete: ${successfulEvents}/${events.length} events saved`);
    
    // Update agent last seen
    await Agent.findOneAndUpdate(
      { agent_id },
      { last_seen: new Date(), status: "online" }
    );
    
    res.json({ 
      success: true, 
      message: `Processed ${events.length} events`,
      saved: successfulEvents,
      failed: events.length - successfulEvents
    });
    
  } catch (error) {
    console.error('❌ INGEST ERROR:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};

/* ================== COMMAND POLL ================== */
exports.commandPoll = async (req, res) => {
  try {
    const { agent_id } = req.params;
    
    // Find pending commands for this agent
    const pendingCommands = await Command.find({
      agent_id,
      status: "pending"
    }).sort({ created_at: 1 }).limit(5);
    
    // Update agent last seen
    await Agent.findOneAndUpdate(
      { agent_id },
      { last_seen: new Date(), status: "online" }
    );
    
    if (pendingCommands.length === 0) {
      return res.json([]);
    }
    
    res.json(pendingCommands);
  } catch (error) {
    console.error("Command poll error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ================== COMMAND RESULT ================== */
exports.commandResult = async (req, res) => {
  try {
    const { agent_id } = req.params;
    const { command_id, exit_code, output } = req.body;
    
    // Find and update command
    const command = await Command.findOneAndUpdate(
      { _id: command_id, agent_id },
      {
        status: exit_code === 0 ? "completed" : "failed",
        exit_code,
        output,
        completed_at: new Date()
      },
      { new: true }
    );
    
    if (!command) {
      return res.status(404).json({ error: "Command not found" });
    }
    
    // Update agent last seen
    await Agent.findOneAndUpdate(
      { agent_id },
      { last_seen: new Date(), status: "online" }
    );
    
    res.json({
      success: true,
      message: "Command result received",
      command_id: command._id
    });
  } catch (error) {
    console.error("Command result error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};