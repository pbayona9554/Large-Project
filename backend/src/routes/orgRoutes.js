const express = require("express");
const router = express.Router();

// controller functions
const {
  getOrgs,
  getOrg,
  createOrg,
  updateOrg
} = require("../controllers/orgController");

// Base route: /api/orgs
router.get("/", getOrgs);
router.get("/:id", getOrg);
// router.post("/", protect, officerOnly, createOrg); // If you want middleware
router.post("/", createOrg);
// router.patch("/:id", protect, officerOnly, updateOrg);
router.patch("/:id", updateOrg);

module.exports = router;