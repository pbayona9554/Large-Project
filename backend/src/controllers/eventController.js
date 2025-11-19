// src/controllers/eventController.js
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

// ==============================================
// GET /api/events
// ==============================================
exports.getAllEvents = async (req, res) => {
  try {
    const db = getDB();
    const { search, category, sort } = req.query;

    const filter = {};
    if (category && category !== "All") filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };

    let cursor = db.collection("Events").find(filter);

    if (sort === "alphabetical") cursor = cursor.sort({ name: 1 });
    if (sort === "date") cursor = cursor.sort({ date: 1 });
    if (sort === "featured") cursor = cursor.sort({ featured: -1 });

    const events = await cursor.toArray();
    res.status(200).json({ events });
  } catch (err) {
    console.error("Get all events error:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

// ==============================================
// GET /api/events/:name
// ==============================================
exports.getEventByName = async (req, res) => {
  try {
    const db = getDB();
    const eventName = decodeURIComponent(req.params.name);
    const event = await db.collection("Events").findOne({ name: eventName });
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.status(200).json(event);
  } catch (err) {
    console.error("Get event by name error:", err);
    res.status(500).json({ error: "Failed to fetch event" });
  }
};

// ==============================================
// POST /api/events
// ==============================================
exports.createEvent = async (req, res) => {
  try {
    const db = getDB();

    // Support both formData and JSON
    const body = req.body instanceof FormData ? Object.fromEntries(req.body) : req.body;

    const { name, description, date, time, location, category, logo, featured, organization } = body;

    if (!name || !date || !location) {
      return res.status(400).json({ error: "Name, date, and location are required" });
    }

    // Combine date + time if provided
    let fullDate = new Date(date);
    if (time) {
      const [hours, minutes] = time.split(":").map(Number);
      const isPM = time.toLowerCase().includes("pm");
      let hrs = hours % 12 + (isPM ? 12 : 0);
      if (isNaN(hrs)) hrs = hours;
      fullDate.setHours(hrs, minutes || 0);
    }

    const newEvent = {
      name: name.trim(),
      description: description?.trim() || "",
      date: fullDate,
      location: location.trim(),
      category: category || "General",
      organization: organization || "University Event",
      logo: logo || "/ucf-knight-placeholder.png",
      attendees: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      featured: featured === "true" || featured === true,
    };

    const result = await db.collection("Events").insertOne(newEvent);
    res.status(201).json({
      message: "Event created successfully",
      event: { _id: result.insertedId, ...newEvent },
    });
  } catch (err) {
    console.error("Create event error:", err);
    res.status(500).json({ error: "Failed to create event" });
  }
};


// ==============================================
// PUT /api/events/id/:id  
// ==============================================
exports.updateEventById = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    const body = req.body instanceof FormData ? Object.fromEntries(req.body) : req.body;
    const updates = { ...body, updatedAt: new Date() };

    // Prevent name changes via ID route (safer)
    //delete updates.name;

    const result = await db.collection("Events").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: "after" }
    );

    if (!result.value) return res.status(404).json({ error: "Event not found" });

    res.status(200).json({
      message: "Event updated successfully",
      event: result.value,
    });
  } catch (err) {
    console.error("Update event by ID error:", err);
    res.status(500).json({ error: "Failed to update event" });
  }
};


exports.deleteEventById = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID" });

    const result = await db.collection("Events").deleteOne({ _id: new ObjectId(id) });
    if (!result.deletedCount) return res.status(404).json({ error: "Event not found" });

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Delete by ID error:", err);
    res.status(500).json({ error: "Failed to delete event" });
  }
};

// ==============================================
// POST /api/events/:id/rsvp  ← NOW USES ID (RELIABLE)
// ==============================================
exports.rsvpEvent = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const userId = req.user?.id;

    let event;
    if (ObjectId.isValid(id)) {
      event = await db.collection("Events").findOne({ _id: new ObjectId(id) });
    } else {
      const name = decodeURIComponent(id);
      event = await db.collection("Events").findOne({ name });
    }

    if (!event) return res.status(404).json({ error: "Event not found" });

    await db.collection("Events").updateOne(
      { _id: event._id },
      { $addToSet: { attendees: new ObjectId(String(userId)) } }
    );

    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $addToSet: { rsvps: event._id } }
    );

    res.status(200).json({ message: `RSVP'd to ${event.name}` });
  } catch (err) {
    console.error("RSVP error:", err);
    res.status(500).json({ error: "Failed to RSVP" });
  }
};

exports.cancelRSVP = async (req, res) => {
  // Same logic as above, just $pull
  // ... (you can implement later if needed)
};