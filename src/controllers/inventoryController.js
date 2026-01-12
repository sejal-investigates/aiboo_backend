const Inventory = require('../models/Inventory');

class InventoryController {
  // Get latest inventory for an agent
  static async getLatestInventory(req, res) {
    try {
      const inventory = await Inventory.findOne({ agent_id: req.params.agent_id })
        .sort({ timestamp: -1 });
      
      if (!inventory) {
        return res.status(404).json({ error: "No inventory found" });
      }
      
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get inventory history for an agent
  static async getInventoryHistory(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const inventory = await Inventory.find({ agent_id: req.params.agent_id })
        .sort({ timestamp: -1 })
        .limit(limit);
      
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get all computers with their latest inventory
  static async getComputersSummary(req, res) {
    try {
      const agents = await Inventory.aggregate([
        {
          $sort: { timestamp: -1 }
        },
        {
          $group: {
            _id: "$agent_id",
            latest: { $first: "$$ROOT" }
          }
        },
        {
          $project: {
            agent_id: "$_id",
            hostname: "$latest.hardware.hostname",
            os_version: "$latest.hardware.os_version",
            cpu_name: "$latest.hardware.cpu_name",
            total_memory_gb: "$latest.hardware.total_memory_gb",
            last_seen: "$latest.timestamp",
            security_status: {
              firewall_enabled: "$latest.security.firewall_enabled",
              bitlocker_enabled: "$latest.security.bitlocker_enabled"
            }
          }
        }
      ]);
      
      res.json(agents);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = InventoryController;