const express = require("express");
const router = express.Router();
const Command = require("../models/Command");

// agent polls for commands
router.get("/:agent_id", async (req, res) => {
  const cmds = await Command.find({
    agent_id: req.params.agent_id,
    status: "pending"
  });
  
  res.json(cmds.map(cmd => ({
    _id: cmd._id,
    agent_id: cmd.agent_id,
    payload: cmd.command,
    status: cmd.status
  })));
});

router.post("/result/:id", async (req, res) => {
  console.log("📥 Result endpoint hit");
  console.log("📥 Content-Type:", req.headers['content-type']);
  
  // Get RAW body before Express parses it
  let rawBody = '';
  req.on('data', chunk => {
    rawBody += chunk.toString();
  });
  
  req.on('end', async () => {
    console.log("📥 RAW Body received:", rawBody);
    console.log("📥 Body length:", rawBody.length);
    
    let body;
    
    if (req.headers['content-type'] === 'text/plain') {
      try {
        console.log("⚠️ Trying to parse as JSON:", rawBody);
        body = JSON.parse(rawBody);
      } catch (e) {
        console.error("❌ Failed to parse JSON. Raw:", rawBody);
        console.error("❌ Error:", e.message);
        
        // Try to fix common issues
        try {
          // Maybe it's URL-encoded?
          const decoded = decodeURIComponent(rawBody);
          console.log("🔧 URL-decoded:", decoded);
          body = JSON.parse(decoded);
        } catch (e2) {
          return res.status(400).json({ 
            error: "Invalid JSON", 
            raw: rawBody,
            length: rawBody.length 
          });
        }
      }
    } else {
      body = req.body;
    }
    
    console.log("📥 Parsed body:", body);
    
    if (!body || body.exit_code === undefined || body.output === undefined) {
      return res.status(400).json({ 
        error: "Missing exit_code or output", 
        received: body,
        raw: rawBody 
      });
    }
    
    const { exit_code, output } = body;
    
    try {
      await Command.findByIdAndUpdate(req.params.id, {
        status: "done",
        exit_code: exit_code,
        output: output,
        completed_at: new Date()
      });
      
      console.log("✅ Result saved");
      res.json({ ok: true });
      
    } catch (error) {
      console.error("❌ Database error:", error);
      res.status(500).json({ error: error.message });
    }
  });
});

module.exports = router;