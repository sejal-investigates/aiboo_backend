// Import Event model
const Event = require("../models/Event");

// Function to fetch all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ timestamp: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

// Function to create a new event
exports.createEvent = async (req, res) => {
  try {
    const { name, rawData } = req.body; // get data from frontend
    const event = new Event({ name, rawData }); // create new event
    await event.save(); // save in MongoDB
    res.status(201).json(event); // send saved event as response
  } catch (err) {
    res.status(500).json({ error: "Failed to create event" });
  }
};
