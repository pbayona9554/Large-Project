const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();



const { connectDB } = require("./src/config/db");
const JWT_SECRET=process.env.JWT_SECRET;

const orgRoutes = require("./routes/orgs");

const app = express();
app.use(cors());
app.use(express.json());



// connect first, then start server
async function start() {
  try {
    const db = await connectDB();
    const PORT = process.env.PORT || 5003;
    app.listen(PORT, () => console.log(`🚀 API running on port ${PORT}`));

    //Define routes below
    //app.use("/api/auth", authRoutes);
    app.use("/api/orgs", orgRoutes);
    //app.use("/api/events", eventRoutes);
  }
  catch{
    console.error("Startup error:", err);
    process.exit(1);
  }
}

app.post("/api/addcard", async (req, res) => {
  const { userId, card } = req.body;
  if (!card || typeof card !== "string") {
    return res.status(400).json({ error: "Card must be a non empty string" });
  }

  try {
    const doc = { Card: card.trim(), UserId: userId ?? null };
    const result = await db.collection("Cards").insertOne(doc);   // 2) await write
    return res.status(200).json({ insertedId: result.insertedId, error: "" });
  } catch (e) {
    console.error("addcard error:", e);                           // 4) log it
    return res.status(500).json({ error: e.message });
  }
});


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

// graceful shutdown
process.on("SIGINT", async () => {
  try { await client?.close(); } finally { process.exit(0); }
});

start();
