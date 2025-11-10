// Configure MongoDB connection (no mongoose)
const { MongoClient } = require("mongodb");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;

let client;
let db;

async function connectDB() {
  if (db) return db; // reuse existing db connection

  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log(" Mongo connected");
    return db;
  } catch (err) {
    console.error(" Mongo connection failed:", err);
    process.exit(1);
  }
}

function getDB() {
  if (!db) throw new Error("Database not connected yet");
  return db;
}

module.exports = { connectDB, getDB };
