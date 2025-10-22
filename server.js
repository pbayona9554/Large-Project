const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const MONGO_URI = "mongodb+srv://mern_user:Mern12345@cluster0.kkd8oss.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // move this to an env var in real projects
const DB_NAME = "large_projectDB";

const app = express();
app.use(cors());
app.use(express.json());

let client;
let db;

// connect first, then start server
async function start() {
  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();                       // 1) wait for connect
    db = client.db(DB_NAME);
    console.log("Mongo connected");

    const PORT = process.env.PORT || 5003;
    app.listen(PORT, () => console.log(`API on ${PORT}`));
  } catch (err) {
    console.error("Mongo connection failed:", err);
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

app.post("/api/login", async (req, res) => {
  const { login, password } = req.body;
  try {
    const user = await db
      .collection("users")
      .findOne({ Login: login, Password: password });
    if (!user) {
      return res.status(200).json({ id: -1, firstName: "", lastName: "", error: "Invalid user name or password" });
    }
    return res.status(200).json({
      id: user.UserID,
      firstName: user.FirstName,
      lastName: user.LastName,
      error: ""
    });
  } catch (e) {
    console.error("login error:", e);
    return res.status(500).json({ id: -1, firstName: "", lastName: "", error: e.message });
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
