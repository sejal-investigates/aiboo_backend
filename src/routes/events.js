const express = require("express");
const router = express.Router();
const controller = require("../controllers/eventsController");

// =============== EXISTING ROUTES ===============
// GET all events
router.get("/", controller.getAllEvents);

// POST new event
router.post("/", controller.createEvent);

// =============== NEW TELEMETRY ENDPOINTS ===============
// ✅ POST: Ingest telemetry from agent (main endpoint agent will use)
router.post("/ingest", controller.ingestTelemetry);

// ✅ GET: Get latest inventory for specific agent
router.get("/inventory/:agent_id", controller.getAgentInventory);

// ✅ GET: Get summary of all agents
router.get("/agents/summary", controller.getAllAgentsSummary);

// ✅ GET: Get agent's event history
router.get("/agent/:agent_id", controller.getAgentEvents);

// ✅ GET: Get agent's process history
router.get("/agent/:agent_id/processes", controller.getAgentProcesses);

// ✅ GET: Get agent's heartbeats
router.get("/agent/:agent_id/heartbeats", controller.getAgentHeartbeats);

// ✅ GET: Get inventory history for agent
router.get("/agent/:agent_id/inventory-history", controller.getAgentInventoryHistory);

module.exports = router;