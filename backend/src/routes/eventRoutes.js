//This file defines the route for all related events functionality APIs

const express = require("express");
const router = express.Router();
const {
    getAllEvents,
    createEvent
} = require("../controllers/eventController");

router.get("/", getAllEvents);
router.post("/",createEvent);

module.exports = router;