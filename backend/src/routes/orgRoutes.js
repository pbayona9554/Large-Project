const express = require("express");
const router = express.Router();
const { getDB } = require("../config/db");

const {
  getAllOrgs,
  getOrgByName,
  createOrg,
  updateOrgByName,
  updateOrgById,
  joinOrg,
  leaveOrg,
  getCategories,
  deleteOrgById
} = require("../controllers/orgController");

const { protect } = require("../middleware/authMiddleware");
const { officerOnly } = require("../middleware/roleMiddleware");

// Public
router.get("/", getAllOrgs); 

router.get("/categories", async (req, res) => {
  try {
    const db = getDB();
    const categories = await db.collection("clubs").distinct("category");
    res.status(200).json({ categories });
  } catch (err) {
    console.error("Get categories error:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.get("/:name", getOrgByName);

// Officer/Admin
router.post("/", protect, officerOnly, createOrg);
router.patch("/:name", protect, officerOnly, updateOrgByName);
router.delete("/id/:id", protect, officerOnly, deleteOrgById);
router.put("/id/:id", protect, officerOnly, updateOrgById);

// Member
router.post("/:id/join", protect, joinOrg);
router.post("/:name/leave", protect, leaveOrg);
router.get("/categories", getCategories);

module.exports = router;