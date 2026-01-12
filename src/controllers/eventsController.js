const Event = require("../models/Event");
const Inventory = require("../models/Inventory");

// Function to fetch all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ timestamp: -1 });
    res.json(events);
  } catch (err) {
    console.error("❌ getAllEvents error:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

// Function to create a new event
exports.createEvent = async (req, res) => {
  try {
    const { name, rawData } = req.body;
    const event = new Event({ name, rawData });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    console.error("❌ createEvent error:", err);
    res.status(500).json({ error: "Failed to create event" });
  }
};

// ✅ NEW: Process telemetry ingestion from agent
exports.ingestTelemetry = async (req, res) => {
  console.log("📥 Ingest telemetry called, body:", JSON.stringify(req.body).substring(0, 500));
  
  try {
    const { agent_id, events } = req.body;
    
    if (!agent_id || !events || !Array.isArray(events)) {
      console.error("❌ Invalid request format:", { agent_id, events });
      return res.status(400).json({ error: "Invalid request format. Expected {agent_id, events: []}" });
    }
    
    console.log(`📥 Processing ${events.length} events from agent ${agent_id}`);
    
    const processedEvents = [];
    let inventorySaved = 0;
    
    for (const event of events) {
      try {
        console.log(`📥 Processing event type: ${event.type}`);
        
        // Save basic event
        const savedEvent = await Event.create({
          agent_id: agent_id,
          type: event.type,
          data: event,
          timestamp: new Date(event.timestamp_unix * 1000)
        });
        
        processedEvents.push(savedEvent);
        
        // ✅ SPECIAL HANDLING: InventorySnapshot
        if (event.type === "InventorySnapshot" && event.inventory) {
          console.log(`📦 Processing InventorySnapshot from ${agent_id}`);
          await processInventorySnapshot(agent_id, event);
          inventorySaved++;
        }
        
        // ✅ SPECIAL HANDLING: Heartbeat
        if (event.type === "Heartbeat") {
          console.log(`💓 Heartbeat from ${agent_id}`);
          await updateAgentLastSeen(agent_id, event);
        }
        
        // ✅ SPECIAL HANDLING: ProcessSnapshot
        if (event.type === "ProcessSnapshot") {
          console.log(`📊 Process snapshot from ${agent_id}: ${event.processes?.length || 0} processes`);
          await storeProcessSnapshot(agent_id, event);
        }
        
      } catch (eventErr) {
        console.error(`❌ Failed to process event ${event.type}:`, eventErr.message);
      }
    }
    
    console.log(`✅ Ingest completed: ${processedEvents.length} events processed, ${inventorySaved} inventory saved`);
    
    res.json({ 
      ok: true, 
      processed: processedEvents.length,
      inventory_saved: inventorySaved,
      message: `Processed ${processedEvents.length} events, saved ${inventorySaved} inventory snapshots`
    });
    
  } catch (err) {
    console.error("❌ Telemetry ingestion error:", err);
    res.status(500).json({ 
      error: "Failed to process telemetry", 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// ✅ Helper: Process InventorySnapshot
async function processInventorySnapshot(agent_id, event) {
  try {
    const inventoryData = event.inventory;
    
    console.log(`📦 Saving inventory for ${agent_id}, has hardware: ${!!inventoryData.hardware}`);
    
    // Save to Inventory collection
    const inventoryDoc = {
      agent_id: agent_id,
      timestamp: new Date(event.timestamp_unix * 1000),
      
      // Hardware (check if exists)
      hardware: inventoryData.hardware || {},
      
      // Software (check if exists)
      software: inventoryData.software || {
        installed_programs: [],
        running_services: 0,
        startup_programs: [],
        browser_extensions: []
      },
      
      // Network (check if exists)
      network: inventoryData.network || {
        interfaces: [],
        domain: "",
        workgroup: "",
        network_shares: [],
        wifi_networks: []
      },
      
      // System Configuration (check if exists)
      configuration: inventoryData.configuration || {
        local_users: [],
        admin_users: [],
        environment_vars: [],
        scheduled_tasks: [],
        group_policies: []
      },
      
      // Security Assessment (check if exists)
      security: inventoryData.security || {
        firewall_enabled: false,
        windows_defender_enabled: false,
        antivirus_installed: false,
        antivirus_name: "",
        bitlocker_enabled: false,
        uac_enabled: false,
        last_update_date: "",
        missing_updates_count: 0,
        open_ports: [],
        listening_services: [],
        encryption_status: "",
        last_password_change_days: 0,
        login_history: []
      }
    };
    
    const savedInventory = await Inventory.create(inventoryDoc);
    console.log(`✅ Inventory saved for agent ${agent_id}, ID: ${savedInventory._id}`);
    
    return savedInventory;
    
  } catch (err) {
    console.error(`❌ Failed to save inventory for agent ${agent_id}:`, err.message);
    console.error("Inventory data structure:", JSON.stringify(event.inventory).substring(0, 300));
    throw err;
  }
}

// ✅ Helper: Update agent last seen (for heartbeats)
async function updateAgentLastSeen(agent_id, heartbeatEvent) {
  try {
    // You could update an agents collection here
    // For now, just log
    console.log(`💓 Heartbeat from ${agent_id}, uptime: ${heartbeatEvent.uptime_seconds}s`);
  } catch (err) {
    console.error("Failed to update agent last seen:", err);
  }
}

// ✅ Helper: Store process snapshot
async function storeProcessSnapshot(agent_id, processEvent) {
  try {
    // Optional: Store in separate collection
    console.log(`📊 Process snapshot from ${agent_id}: ${processEvent.processes?.length || 0} processes`);
  } catch (err) {
    console.error("Failed to store process snapshot:", err);
  }
}

// ✅ NEW: Get latest inventory for an agent
exports.getAgentInventory = async (req, res) => {
  try {
    const { agent_id } = req.params;
    
    console.log(`📥 Getting latest inventory for ${agent_id}`);
    
    const inventory = await Inventory.findOne({ agent_id })
      .sort({ timestamp: -1 });
    
    if (!inventory) {
      return res.status(404).json({ error: "No inventory found for this agent" });
    }
    
    res.json(inventory);
    
  } catch (err) {
    console.error("❌ getAgentInventory error:", err);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
};

// ✅ NEW: Get all agents with their latest inventory
exports.getAllAgentsSummary = async (req, res) => {
  try {
    console.log("📥 Getting all agents summary");
    
    const agents = await Inventory.aggregate([
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: "$agent_id",
          latest_inventory: { $first: "$$ROOT" }
        }
      },
      {
        $project: {
          agent_id: "$_id",
          hostname: "$latest_inventory.hardware.hostname",
          os: "$latest_inventory.hardware.os_version",
          cpu: "$latest_inventory.hardware.cpu_name",
          ram_gb: "$latest_inventory.hardware.total_memory_gb",
          last_seen: "$latest_inventory.timestamp",
          security_status: {
            firewall: "$latest_inventory.security.firewall_enabled",
            defender: "$latest_inventory.security.windows_defender_enabled",
            bitlocker: "$latest_inventory.security.bitlocker_enabled"
          }
        }
      }
    ]);
    
    console.log(`✅ Found ${agents.length} agents`);
    res.json(agents);
    
  } catch (err) {
    console.error("❌ getAllAgentsSummary error:", err);
    res.status(500).json({ error: "Failed to fetch agents summary" });
  }
};

// ✅ NEW: Get agent's event history
exports.getAgentEvents = async (req, res) => {
  try {
    const { agent_id } = req.params;
    const { type, limit = 50 } = req.query;
    
    const query = { agent_id };
    if (type) query.type = type;
    
    const events = await Event.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch agent events" });
  }
};

// ✅ NEW: Get agent's process history
exports.getAgentProcesses = async (req, res) => {
  try {
    const { agent_id } = req.params;
    const { limit = 10 } = req.query;
    
    const events = await Event.find({ 
      agent_id, 
      type: { $in: ["ProcessSnapshot", "ProcessStarted", "ProcessStopped"] }
    })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch process history" });
  }
};

// ✅ NEW: Get agent's heartbeats
exports.getAgentHeartbeats = async (req, res) => {
  try {
    const { agent_id } = req.params;
    const { hours = 24 } = req.query;
    
    const since = new Date(Date.now() - (hours * 60 * 60 * 1000));
    
    const events = await Event.find({ 
      agent_id, 
      type: "Heartbeat",
      timestamp: { $gte: since }
    })
      .sort({ timestamp: 1 });
    
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch heartbeats" });
  }
};

// ✅ NEW: Get inventory history for agent
exports.getAgentInventoryHistory = async (req, res) => {
  try {
    const { agent_id } = req.params;
    const { limit = 5 } = req.query;
    
    const inventory = await Inventory.find({ agent_id })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch inventory history" });
  }
};