const express = require("express");
const router = express.Router();

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Live Scan
router.post("/scan", async (req, res) => {
  await delay(1000);
  res.json({ status: "Live scan completed successfully!" });
});

// Generate Report
router.post("/report", async (req, res) => {
  await delay(1000);
  res.json({ file: "report-2025-12-20.pdf" });
});

// Quick Access
router.post("/server", async (req, res) => { await delay(500); res.json({ status: "Server Center accessed" }); });
router.post("/surveillance", async (req, res) => { await delay(500); res.json({ status: "Surveillance system accessed" }); });
router.post("/pentest", async (req, res) => { await delay(500); res.json({ status: "Pen Test module accessed" }); });
router.post("/digital-gates", async (req, res) => { await delay(500); res.json({ status: "Digital Gates module accessed" }); });

module.exports = router;
