const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

// ==============================================
// GET /api/events
// List all events (with search, category, sorting)
// ==============================================
exports.getAllEvents = async (req, res) => {
  try {
    const db = getDB();
    const { search, category, sort } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };

    let cursor = db.collection("Events").find(filter);

    // Sorting options
    if (sort === "alphabetical") cursor = cursor.sort({ name: 1 });
    if (sort === "date") cursor = cursor.sort({ date: 1 });
    if (sort === "featured") cursor = cursor.sort({ featured: -1 });

    const events = await cursor.toArray();
    res.status(200).json({ count: events.length, events });
  } catch (err) {
    console.error("Get all events error:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

// ==============================================
// GET /api/events/:name
// Get a single event by name
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
// Create new event (officer/admin only)
// ==============================================
exports.createEvent = async (req, res) => {
  try {
    const db = getDB();
    const { name, description, date, location, orgName, category } = req.body;

    if (!name || !date || !location || !orgName) {
      return res
        .status(400)
        .json({ error: "Name, date, location, and orgName are required" });
    }

    // Validate org existence
    const org = await db.collection("Org").findOne({ name: orgName });
    if (!org) return res.status(404).json({ error: "Organization not found" });

    const newEvent = {
      name,
      description: description || "",
      date: new Date(date),
      location,
      orgName,
      category: category || org.category,
      createdAt: new Date(),
      featured: false,
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
// PATCH /api/events/:name
// Update an existing event by name (officer/admin)
// ==============================================
exports.updateEventByName = async (req, res) => {
  try {
    const db = getDB();
    const eventName = decodeURIComponent(req.params.name);
    const updates = req.body;

    const result = await db
      .collection("Events")
      .findOneAndUpdate(
        { name: eventName },
        { $set: updates },
        { returnDocument: "after" }
      );

    if (!result.value)
      return res.status(404).json({ error: "Event not found" });

    res
      .status(200)
      .json({ message: "Event updated successfully", event: result.value });
  } catch (err) {
    console.error("Update event error:", err);
    res.status(500).json({ error: "Failed to update event" });
  }
};

// ==============================================
// DELETE /api/events/:name
// Delete an event by name (officer/admin)
// ==============================================
exports.deleteEventByName = async (req, res) => {
  try {
    const db = getDB();
    const eventName = decodeURIComponent(req.params.name);

    const result = await db.collection("Events").deleteOne({ name: eventName });
    if (!result.deletedCount)
      return res.status(404).json({ error: "Event not found" });

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Delete event error:", err);
    res.status(500).json({ error: "Failed to delete event" });
  }
};

// ==============================================
// POST /api/events/:name/rsvp
// User RSVPs to an event
// ==============================================
exports.rsvpEvent = async (req, res) => {
  try {
    const db = getDB();
    const eventName = decodeURIComponent(req.params.name);
    const userId = req.user?.id;

    const event = await db.collection("Events").findOne({ name: eventName });
    if (!event) return res.status(404).json({ error: "Event not found" });

    await db.collection("users").updateOne(
      { _id: new ObjectId(String(userId)) },
      { $addToSet: { eventsRSVPd: eventName } }
    );

    res.status(200).json({ message: `RSVP'd to ${eventName}` });
  } catch (err) {
    console.error("RSVP event error:", err);
    res.status(500).json({ error: "Failed to RSVP for event" });
  }
};

// ==============================================
// POST /api/events/:name/cancel-rsvp
// User cancels RSVP for an event
// ==============================================
exports.cancelRSVP = async (req, res) => {
  try {
    const db = getDB();
    const eventName = decodeURIComponent(req.params.name);
    const userId = req.user?.id;

    const event = await db.collection("Events").findOne({ name: eventName });
    if (!event) return res.status(404).json({ error: "Event not found" });

    await db.collection("users").updateOne(
      { _id: new ObjectId(String(userId)) },
      { $pull: { eventsRSVPd: eventName } }
    );

    res.status(200).json({ message: `Canceled RSVP for ${eventName}` });
  } catch (err) {
    console.error("Cancel RSVP error:", err);
    res.status(500).json({ error: "Failed to cancel RSVP" });
  }
};
