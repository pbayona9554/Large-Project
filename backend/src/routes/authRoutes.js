const express = require("express");
const router = express.Router();
const { SignIn, Login, VerifyEmail } = require("../controllers/authController");

// Login
router.post("/login", SignIn);

// Register/Signup
router.post("/register", Login);

router.post("/verify", VerifyEmail);

module.exports = router;