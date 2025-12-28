require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const eventsRoutes = require("./routes/events");
const dashboardRoutes = require("./routes/dashboard");
const agentRoutes = require("./routes/agent");

const app = express();

/* ✅ MIDDLEWARE FIRST */
app.use(cors());
app.use(express.json());

/* ✅ ROUTES */
app.use("/agent", agentRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api", dashboardRoutes);

/* ✅ TEST ROUTE */
app.get("/", (req, res) => {
  res.send("Backend is working!");
});

/* ✅ CONNECT DB + START SERVER */
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");

    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT} 🚀`);
    });
  })
  .catch(err => {
    console.error("MongoDB connection error ❌", err);
  });
