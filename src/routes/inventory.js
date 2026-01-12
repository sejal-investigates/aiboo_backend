const express = require("express");
const router = express.Router();
const InventoryController = require("../controllers/inventoryController");
// Get latest inventory for an agent
router.get("/:agent_id/latest", InventoryController.getLatestInventory);

// Get inventory history for an agent
router.get("/:agent_id/history", InventoryController.getInventoryHistory);

// Get all computers with their latest inventory
router.get("/computers/summary", InventoryController.getComputersSummary);

module.exports = router;