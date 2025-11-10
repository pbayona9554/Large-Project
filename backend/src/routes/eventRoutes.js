const express = require("express");
const router = express.Router();
const {
  getAllEvents,
  getEventByName,
  createEvent,
  updateEventByName,
  deleteEventByName,
  rsvpEvent,
  cancelRSVP,
} = require("../controllers/eventController");

const { protect } = require("../middleware/authMiddleware");
const { officerOnly } = require("../middleware/roleMiddleware");

// Public
router.get("/", getAllEvents); // ?search=&category=&sort=
router.get("/:name", getEventByName);

// Officer/Admin
router.post("/", protect, officerOnly, createEvent);
router.patch("/:name", protect, officerOnly, updateEventByName);
router.delete("/:name", protect, officerOnly, deleteEventByName);

// Member
router.post("/:name/rsvp", protect, rsvpEvent);
router.post("/:name/cancel-rsvp", protect, cancelRSVP);

module.exports = router;
