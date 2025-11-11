// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDB } = require("./src/config/db");

// Route imports
const authRoutes = require("./src/routes/authRoutes");
const orgRoutes = require("./src/routes/orgRoutes");
const eventRoutes = require("./src/routes/eventRoutes");

// Middleware imports
const { notFound, errorHandler } = require("./src/middleware/errorMiddleware");

const app = express();
app.use(cors());
app.use(express.json());

async function start() {
  try {
    // 1️⃣ Connect to MongoDB
    await connectDB();

    // 2️⃣ Mount all routes
    app.use("/api/auth", authRoutes);
    app.use("/api/orgs", orgRoutes);
    app.use("/api/events", eventRoutes);

    // 3️⃣ Global error handling middleware
    app.use(notFound);
    app.use(errorHandler);

    // 4️⃣ Start server
    const PORT = process.env.PORT || 5003;
    app.listen(PORT, () =>
      console.log(`✅ Server running and Mongo connected on port ${PORT}`)
    );
  } catch (err) {
    console.error(" Startup error:", err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    console.log(" Shutting down server...");
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
});

start();
