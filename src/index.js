require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const eventsRoutes = require("./routes/events");
const dashboardRoutes = require("./routes/dashboard");
const agentRoutes = require("./routes/agent");
const commandRoutes = require("./routes/commands");

const app = express();

/* ✅ DEBUG MIDDLEWARE - ADD THIS FIRST */
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  console.log('📥 Headers:', req.headers['content-type']);
  console.log('📥 Body exists:', !!req.body);
  next();
});

/* ✅ MIDDLEWARE */
app.use(cors());
app.use(express.json());

/* ✅ ROUTES */
app.use("/agent", agentRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/commands", commandRoutes);

/* ✅ TEST ROUTE */
app.get("/", (req, res) => {
  res.send("Backend is working!");
});

/* ✅ CREATE REQUIRED COLLECTIONS ON STARTUP */
async function initializeCollections() {
  try {
    // Ensure Inventory collection exists with proper indexes
    const inventorySchema = new mongoose.Schema({
      agent_id: { type: String, required: true, index: true },
      timestamp: { type: Date, default: Date.now, index: true },
      hardware: mongoose.Schema.Types.Mixed,
      software: mongoose.Schema.Types.Mixed,
      network: mongoose.Schema.Types.Mixed,
      configuration: mongoose.Schema.Types.Mixed,
      security: mongoose.Schema.Types.Mixed
    });
    
    // Check if Inventory model already exists
    if (!mongoose.models.Inventory) {
      mongoose.model("Inventory", inventorySchema);
      console.log("✅ Inventory model initialized");
    }
    
    // Ensure Event collection has proper fields for telemetry
    const eventSchema = new mongoose.Schema({
      agent_id: { type: String, index: true },
      type: { type: String, index: true },
      data: mongoose.Schema.Types.Mixed,
      timestamp: { type: Date, default: Date.now, index: true },
      name: String,
      rawData: mongoose.Schema.Types.Mixed
    });
    
    // Create indexes for better performance
    await mongoose.connection.collection("events").createIndex({ agent_id: 1, timestamp: -1 });
    await mongoose.connection.collection("events").createIndex({ type: 1, timestamp: -1 });
    await mongoose.connection.collection("inventories").createIndex({ agent_id: 1, timestamp: -1 });
    
    console.log("✅ Database indexes created");
    
  } catch (err) {
    console.error("❌ Failed to initialize collections:", err);
  }
}

/* ✅ CONNECT DB + START SERVER */
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected ✅");
    
    // Initialize collections after connection
    await initializeCollections();
    
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT} 🚀`);
      console.log(`📡 Agent will send telemetry to: POST /api/events/ingest`);
      console.log(`📊 Dashboard can fetch from: GET /api/events/agents/summary`);
    });
  })
  .catch(err => {
    console.error("MongoDB connection error ❌", err);
  });

/* ✅ ERROR HANDLING MIDDLEWARE */
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    message: err.message 
  });
});