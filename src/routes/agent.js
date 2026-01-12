const express = require("express");
const router = express.Router();
const AgentController = require("../controllers/agentController");

/* ================== ENROLL ================== */
router.post("/enroll", AgentController.enroll);

/* ================== HEARTBEAT ================== */
router.post("/heartbeat", AgentController.heartbeat);

/* ================== TELEMETRY INGEST ================== */
router.post("/ingest", AgentController.ingest);

/* ================== COMMAND POLL ================== */
router.get("/command/:agent_id", AgentController.commandPoll);

/* ================== COMMAND RESULT ================== */
router.post("/command/:agent_id/result", AgentController.commandResult);

module.exports = router;