
//This file defines the route for all related authentification APIs

// src/routes/authRoutes.js
const express = require("express");
const router = express.Router();

const { Login, SignUp, getCurrentUser } = require("../controllers/authController");
const {protect} = require("../middleware/authMiddleware");

// base route: /api/auth
router.post("/login", Login);
router.post("/signup", SignUp);
router.post("/me", protect, getCurrentUser);

module.exports = router;


