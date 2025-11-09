require("dotenv").config();

// GET /api/events
exports.getAllEvents = async (req, res) => {
  const db = req.app.locals.db;
  try {
    const events = await db.collection("Events").find().toArray();
    res.status(200).json({ events });
  } catch (err) {
    console.error("getAllEvents error:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

// POST /api/events
exports.createEvent = async (req, res) => {
  const db = req.app.locals.db;
  const { name, description, date, location, clubId } = req.body;

  try {
    const newEvent = {
      name,
      description: description || "",
      date: new Date(date),
      location,
      clubId
    };
    const result = await db.collection("Events").insertOne(newEvent);
    res.status(201).json({ message: "Event created", eventId: result.insertedId });
  } catch (err) {
    console.error("createEvent error:", err);
    res.status(500).json({ error: "Failed to create event" });
  }
};

// POST /api/events/:id/rsvp
export const rsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Check if already RSVP'd
    if (event.rsvps.includes(req.user.id)) {
      return res.status(400).json({ message: "You already RSVP'd to this event" });
    }

    event.rsvps.push(req.user.id);
    await event.save();

    res.json({ message: "RSVP successful", event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/events/:id/cancel-rsvp
export const cancelRsvp = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.rsvps = event.rsvps.filter(
      (userId) => userId.toString() !== req.user.id
    );
    await event.save();

    res.json({ message: "RSVP canceled", event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
