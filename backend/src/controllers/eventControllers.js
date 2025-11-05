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
