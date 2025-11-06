const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Login endpoint
exports.SignIn = async (req, res) => {
  const db = req.app.locals.db;
  const { email, password } = req.body;

  try {
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

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
        clubsjoined: user.clubsjoined,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Signup endpoint
exports.Login = async (req, res) => {
  const db = req.app.locals.db;
  const { name, email, password, role } = req.body;

  try {
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a 6-digit verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();

    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: role || "member",
      verification: false,
      verificationCode, // save code for later verification
      clubsjoined: [],
    };

    const result = await db.collection("users").insertOne(newUser);

    // Send verification email
    await sgMail.send({
      to: email,
      from: process.env.EMAIL_FROM,
      subject: "Verify your email",
      text: `Hello ${name},\n\nYour verification code is: ${verificationCode}\n\nEnter this code in the app to verify your email.`,
    });

    const token = jwt.sign(
      { id: result.insertedId, email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Signup successful. Please check your email for verification code.",
      token,
      user: {
        id: result.insertedId,
        name,
        email,
        role: newUser.role,
        verification: newUser.verification,
        clubsjoined: newUser.clubsjoined,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

//verification endpoint
exports.VerifyEmail = async (req, res) => {
  const { email, code } = req.body;
  const db = req.app.locals.db;

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
};