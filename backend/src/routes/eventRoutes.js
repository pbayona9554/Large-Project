// src/routes/eventRoutes.js
const express = require("express");
const router = express.Router();
const {
    getAllEvents,
    createEvent
} = require("../controllers/eventControllers");

router.get("/", getAllEvents);
router.post("/", createEvent);

module.exports = router;