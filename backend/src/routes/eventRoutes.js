const express = require("express");
const router = express.Router();
const {
  getAllEvents,
  getEventByName,
  createEvent,
  updateEventByName,
  updateEventById,
  deleteEventByName,
  deleteEventById,
  rsvpEvent,
  cancelRSVP,
} = require("../controllers/eventController");

const { protect } = require("../middleware/authMiddleware");
const { officerOnly } = require("../middleware/roleMiddleware");

// Public
router.get("/", getAllEvents);
router.get("/:name", getEventByName);

// Officer/Admin - Legacy (name-based)
router.post("/", protect, officerOnly, createEvent);


// Officer/Admin - NEW & BETTER (ID-based)
router.put("/id/:id", protect, officerOnly, updateEventById);
router.delete("/id/:id", protect, officerOnly, deleteEventById);

// Member - RSVP by ID (reliable!)
router.post("/:id/rsvp", protect, rsvpEvent);
router.post("/:id/cancel-rsvp", protect, cancelRSVP);

module.exports = router;