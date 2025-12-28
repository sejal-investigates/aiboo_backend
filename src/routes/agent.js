const express = require("express");
const router = express.Router();

router.post("/enroll", (req, res) => {
  res.json({
    agent_id: "test-agent-id",
    batch_size: 5,
    batch_timeout_seconds: 15,
    command_poll_interval_seconds: 20
  });
});

module.exports = router;
