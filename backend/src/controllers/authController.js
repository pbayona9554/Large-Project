const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDB } = require("../config/db");
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
console.log("authController loaded");
// ======================================
// POST /api/auth/signup
// ======================================
const SignUp = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const db = getDB();

    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields are required" });

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = crypto.randomInt(100000, 999999).toString();

    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: role || "member",
      verification: false,
      verificationCode,
      clubsjoined: [],
    };

    const result = await db.collection("users").insertOne(newUser);

    if (process.env.SENDGRID_API_KEY && process.env.EMAIL_FROM) {
      try {
        await sgMail.send({
          to: email,
          from: process.env.EMAIL_FROM,
          subject: "Verify your email",
          text: `Hello ${name},\n\nYour verification code is: ${verificationCode}\n\nEnter this code in the app to verify your email.`,
        });
      } catch (emailErr) {
        console.warn("Email could not be sent:", emailErr.message);
      }
    }

    const token = jwt.sign(
      { id: result.insertedId, email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Signup successful. Please check your email for verification code.",
      token,
      user: { id: result.insertedId, ...newUser, password: undefined },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ======================================
// POST /api/auth/login
// ======================================
const Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const db = getDB();

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await db.collection("users").findOne({ email });
    if (!user)
      return res.status(400).json({ error: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verification: user.verification,
        clubsjoined: user.clubsjoined || [],
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ======================================
// GET /api/auth/me
// ======================================
const getCurrentUser = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ error: "Not authorized" });

    res.status(200).json({
      message: "Current user fetched successfully",
      user: req.user,
    });
  } catch (err) {
    console.error("Get current user error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ======================================
// POST /api/auth/verify
// ======================================
const VerifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    const db = getDB();

    const user = await db.collection("users").findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.verificationCode === code) {
      await db.collection("users").updateOne(
        { email },
        { $set: { verification: true }, $unset: { verificationCode: "" } }
      );
      return res.status(200).json({ message: "Email verified successfully" });
    } else {
      return res.status(400).json({ error: "Invalid verification code" });
    }
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Export all functions together
module.exports = {
  SignUp,
  Login,
  getCurrentUser,
  VerifyEmail,
};