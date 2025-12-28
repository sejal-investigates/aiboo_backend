const express = require("express");
const router = express.Router();
const agentController = require("../controllers/agentController");

router.post("/enroll", agentController.enroll);

module.exports = router;
