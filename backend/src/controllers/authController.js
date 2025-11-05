//All API code for authentification will be here

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
        clubsjoined: user.clubsjoined
      }
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

    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: role || "member",
      verification: false,
      clubsjoined: []
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
      user: {
        id: result.insertedId,
        name,
        email,
        role: newUser.role,
        verification: newUser.verification,
        clubsjoined: newUser.clubsjoined
      }
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};