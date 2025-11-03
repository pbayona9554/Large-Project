//All API code for events will be here


//const Event = require("../models/Event"); // Mongoose model or db.collection('events')
const {MongoClient} = require("mogodb");
require("dotenv").config();
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;
let db;

// GET /api/events
exports.getAllEvents = async (req, res) => {
  // Return list of all events
  // Support filtering or sorting via query params
  try{
    const events = await db.collection("Events").find().toArray();
    res.status(400).json({events});
  } 
  catch {
    res.status(500).json({error : "Failed to fetch events"});
  }

};

// GET /api/events/:id
exports.getEventById = async (req, res) => {
  // Find event by ID and return details
};

// POST /api/events
exports.createEvent = async (req, res) => {
  const {name, decription, date, location , clubId} = req.body;

  const newEvent = {
    name,
    description: description || "",
    date: new Date(date),
    location,
    clubId
  }
};

// PATCH /api/events/:id
exports.updateEvent = async (req, res) => {
  // Officer/Admin only
  // Update event fields
};

// DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
  // Officer/Admin only
  // Delete the event
};

// POST /api/events/:id/rsvp
exports.rsvpEvent = async (req, res) => {
  // Member joins event attendees
};

// POST /api/events/:id/cancel-rsvp
exports.cancelRSVP = async (req, res) => {
  // Remove user from event attendees
};

// GET /api/events?search=<query>
exports.searchEvents = async (req, res) => {
  // Use regex or text search on event titles/descriptions
};

// GET /api/events?sort=alphabetical/featured/date
exports.sortEvents = async (req, res) => {
  // Handle sorting logic
};
