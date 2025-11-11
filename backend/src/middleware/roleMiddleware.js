//This file will define the middleware that will give officer more access then regular member
// backend/src/middleware/roleMiddleware.js

// Example middleware to allow only officers/admins
const officerOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not logged in" });
  }

  // Assume req.user.role exists and is 'member', 'officer', or 'admin'
  if (req.user.role !== "officer" && req.user.role !== "admin") {
    return res.status(403).json({ error: "Officers only" });
  }

  next(); // allow access
};

module.exports = { officerOnly };
