// src/routes/eventRoutes.js
const express = require("express");
const router = express.Router();
const {
    getAllEvents,
    createEvent
} = require("../controllers/eventControllers");

import { rsvpEvent, cancelRsvp } from "../controllers/eventController.js";
import { protect } from "../middleware/auth.js";

router.get("/", getAllEvents);
router.post("/", createEvent);
router.post("/:id/rsvp", protect, rsvpEvent);
router.post("/:id/cancel-rsvp", protect, cancelRsvp);

module.exports = router;
