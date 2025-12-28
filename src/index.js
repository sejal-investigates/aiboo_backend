// Load environment variables from .env
require("dotenv").config();

// Import required libraries
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import routes
const eventsRoutes = require("./routes/events");
const dashboardRoutes = require("./routes/dashboard"); // <- existing
// const assistantRoutes = require("./routes/assistant"); // ✅ ADD THIS

const app = express();
const agentRoutes = require("./routes/agent");
app.use("/agent", agentRoutes);


// Middleware
app.use(cors());           // Allow frontend to access backend from different port
app.use(express.json());   // Parse JSON data from requests

// Test route
app.get("/", (req, res) => {
  res.send("Backend is working!");
});

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");

    // Connect routes AFTER MongoDB is connected
    app.use("/api/events", eventsRoutes);
    app.use("/api", dashboardRoutes); // <- existing
    // app.use("/api/assistant", assistantRoutes); // ✅ ADD THIS

    // Start server
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT} 🚀`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error ❌", err);
  });
