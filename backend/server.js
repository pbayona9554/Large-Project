// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDB } = require("./src/config/db");

const JWT_SECRET = process.env.JWT_SECRET;

const authRoutes = require("./src/routes/authRoutes");
const orgRoutes = require("./src/routes/orgRoutes");
const eventRoutes = require("./src/routes/eventRoutes");

const app = express();
app.use(cors());
app.use(express.json());

let db;

async function start() {
  try {
    // Connect to MongoDB
    db = await connectDB();
    app.locals.db = db;
    console.log("🚀 Mongo connected");

    // Register routes
    app.use("/api/auth", authRoutes);
    app.use("/api/orgs", orgRoutes);
    app.use("/api/events", eventRoutes);

    // Example card route
    app.post("/api/addcard", async (req, res) => {
      const { userId, card } = req.body;
      if (!card || typeof card !== "string") {
        return res.status(400).json({ error: "Card must be a non empty string" });
      }
      try {
        const doc = { Card: card.trim(), UserId: userId ?? null };
        const result = await db.collection("Cards").insertOne(doc);
        return res.status(200).json({ insertedId: result.insertedId, error: "" });
      } catch (e) {
        console.error("addcard error:", e);
        return res.status(500).json({ error: e.message });
      }
    });

    // Search cards route
    app.post("/api/searchcards", async (req, res) => {
      const { search = "" } = req.body;
      const q = String(search).trim();
      try {
        const results = await db
          .collection("Cards")
          .find({ Card: { $regex: q + ".*", $options: "i" } })
          .project({ Card: 1, _id: 0 })
          .toArray();
        return res.status(200).json({ results: results.map(r => r.Card), error: "" });
      } catch (e) {
        console.error("searchcards error:", e);
        return res.status(500).json({ results: [], error: e.message });
      }
    });

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 API running on port ${PORT}`));
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  try { await db?.close(); } finally { process.exit(0); }
});

start();