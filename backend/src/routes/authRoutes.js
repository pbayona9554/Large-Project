
//This file defines the route for all related authentification APIs

// src/routes/authRoutes.js
const express = require("express");
const router = express.Router();

const {
  Login,
  SignUp,
  getCurrentUser,
  VerifyEmail,
  ForgotPassword,
  ResetPassword
} = require("../controllers/authController");
const {protect} = require("../middleware/authMiddleware");

// base route: /api/auth
router.post("/login", Login);
router.post("/signup", SignUp);
router.get("/me", protect, getCurrentUser);
router.post("/verify", VerifyEmail);
router.post("/forgot-password", ForgotPassword);
router.post("/reset-password", ResetPassword);

module.exports = router;


