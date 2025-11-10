//This will carry out the JWT auth verification

const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

// Middleware: verify JWT and attach user to req
exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const db = getDB();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(String(decoded.id)) });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // attach user (without password) to request
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      verification: user.verification,
      clubsjoined: user.clubsjoined,
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ error: "Not authorized, invalid token" });
  }
};
