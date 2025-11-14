require("dotenv").config();
const axios = require("axios");
const { MongoClient } = require("mongodb");

const BASE_URL = "/api";
const MONGO_URI = process.env.MONGO_URI; // make sure this is in your .env

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(); // default db name
  console.log("Connected to MongoDB");

  const testUser = {
    name: "Test User",
    email: "testuser@example.com",
    password: "TestPass123",
    role: "member",
  };

  try {
    // 1) Register the user
    console.log("Registering user...");
    await axios.post(`${BASE_URL}/auth/register`, testUser);
    console.log("User registered successfully");

    // 2) Retrieve verification code from DB
    const userInDb = await db.collection("users").findOne({ email: testUser.email });
    const code = userInDb.verificationCode;
    if (!code) throw new Error("No verification code found in DB");

    console.log("Verification code retrieved from DB:", code);

    // 3) Verify the user
    console.log("Verifying user...");
    const verifyResponse = await axios.post(`${BASE_URL}/auth/verify`, {
      email: testUser.email,
      code,
    });
    console.log("Verification response:", verifyResponse.data);

    // 4) Attempt login
    console.log("Logging in...");
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    });
    console.log("Login response:", loginResponse.data);
  } catch (err) {
    console.error("Error during test:", err.response ? err.response.data : err.message);
  } finally {
    await client.close();
  }
}

main();