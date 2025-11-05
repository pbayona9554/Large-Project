const express = require("express");
const router = express.Router();
const { SignIn, Login } = require("../controllers/authController");

// Login
router.post("/login", SignIn);

// Register/Signup
router.post("/register", Login);

module.exports = router;
