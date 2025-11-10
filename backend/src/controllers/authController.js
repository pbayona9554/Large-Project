const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDB } = require("../config/db");

// POST /api/auth/signup
exports.SignUp = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const db = getDB();

    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields are required" });

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: role || "member",
      verification: false,
      clubsjoined: [],
    };

    const result = await db.collection("users").insertOne(newUser);

    const token = jwt.sign(
      { id: result.insertedId, email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Signup successful",
      token,
      user: { id: result.insertedId, ...newUser, password: undefined },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/auth/login
exports.Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = getDB();

    // 1. Validate request
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // 2. Find user
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // 3. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 5. Return user info
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



// GET /api/auth/me
exports.getCurrentUser = async (req, res) => {
  try {
    // req.user comes from protect middleware
    if (!req.user) {
      return res.status(401).json({ error: "Not authorized" });
    }

    res.status(200).json({
      message: "Current user fetched successfully",
      user: req.user,
    });
  } catch (err) {
    console.error("Get current user error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
