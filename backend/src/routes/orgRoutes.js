const express = require("express");
const router = express.Router();
const {
  getAllOrgs,
  getOrgByName,
  createOrg,
  updateOrgByName,
  deleteOrgByName,
  joinOrg,
  leaveOrg,
} = require("../controllers/orgController");

const { protect } = require("../middleware/authMiddleware");
const { officerOnly } = require("../middleware/roleMiddleware");

// Public
router.get("/", getAllOrgs); 
router.get("/:name", getOrgByName);

// Officer/Admin
router.post("/", protect, officerOnly, createOrg);
router.patch("/:name", protect, officerOnly, updateOrgByName);
router.delete("/:name", protect, officerOnly, deleteOrgByName);

// Member
router.post("/:name/join", protect, joinOrg);
router.post("/:name/leave", protect, leaveOrg);

module.exports = router;
