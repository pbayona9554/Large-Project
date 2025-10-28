const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI; // move this to an env var in real projects
const JWT_SECRET=process.env.JWT_SECRET;
const DB_NAME = process.env.DB_NAME;

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


//Login api/endpoint with bcrypt hashing and JWT token session management
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.collection("users").findOne({ email : email});
    if (!email) {
      return res.status(400).json({ error: "Invalid email or password"});
    }

    const bcrypt = require("bcryptjs");
    const isMatch = await bcrypt.compare(password, user.password); 
    if(!isMatch){
      return res.status(400).json({error : "Invalid username or password"});
    }

    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verification: user.verification,
        clubsjoined: user.clubsjoined
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Signup API endpoint with Hashing password and JWT token for session management
app.post("/api/signup", async (req, res) => {
  const {name, email ,password, role} = req.body;
  
  try {
    if(!name || !email || !password || !role) {
      return res.status(400).json({error: "All fields are required"});
    }

    //Check if user exists
    const existingUser = await db.collection("users").findOne({email: email});
    if(existingUser){
      return res.status(400).json({error: "User already exists"});
    }

    //Hash password
    const hashedPassword = await bcrypt.hash(password,10);

    const newUser = {
      name: name,
      email: email,
      password: hashedPassword,
      role: role || "member",
      verification : false,
      clubsjoined: []
    };
    const result = await db.collection("users").insertOne(newUser);
    
    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      {id: result.insertedId, email, role : newUser.role},
      process.env.JWT_SECRET,
      {expiresIn: "1h"} 
    );
    res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: result.insertedId,
        name,
        email,
        role: newUser.role,
        verification: newUser.verification,
        clubsjoined: newUser.clubsjoined
      }
    });
  } catch(err){
    console.error("Signup error:", err);
    res.status(500).json({error: "Internal server error"});
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
