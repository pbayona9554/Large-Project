//This file defines the route for all related organization functionality APIs

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { officerOnly } = require("../middleware/roleMiddleware");
const {        //All of our endpoints related to Organization
  getAllOrgs,  //GETS all organizations in db
  getOrgById,  //GETS spefic org by Id
  createOrg,   //Create organization and POST to db
  updateOrg,   //Update already created organization : PUT or PATCH depending on how much is beign updated
  deleteOrg,   //DELETE organization entity from db
  joinOrg,     //UPDATE users {clubs joined attr, and add the specfic org}
  leaveOrg,    //UPDATE users {clubs joined attr} and delete the specifc org}
} = require("../controllers/orgController");

// base route: /api/orgs
router.get("/", getAllOrgs);
router.get("/:id", getOrgById);
router.post("/", protect, officerOnly, createOrg);
router.patch("/:id", protect, officerOnly, updateOrg);
router.delete("/:id", protect, officerOnly, deleteOrg);
router.post("/:id/join", protect, joinOrg);
router.post("/:id/leave", protect, leaveOrg);

module.exports = router;
