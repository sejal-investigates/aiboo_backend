const express = require("express");
const router = express.Router();
const CommandController = require("../src/controllers/commandController");

// agent polls for commands
router.get("/:agent_id", CommandController.getPendingCommands);

router.post("/result/:id", CommandController.updateCommandResult);

module.exports = router;