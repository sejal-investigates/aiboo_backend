const express = require("express");
const router = express.Router();
const controller = require("../controllers/eventsController");

// GET all events
router.get("/", controller.getAllEvents);

// POST new event
router.post("/", controller.createEvent);

module.exports = router;
