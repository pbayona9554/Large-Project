// src/controllers/orgController.js
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const allowedCategories = ["Tech", "Academic", "Sports", "Cultural", "Social"];

// ==============================================
// GET /api/orgs
// Get all organizations, optional filtering/sorting/search
// ==============================================
exports.getAllOrgs = async (req, res) => {
  try {
    const db = getDB();
    const { category, search, sort } = req.query;
    const filter = {};

    // Filter by category if it's valid
    if (category) {
      if (!allowedCategories.includes(category)) {
        return res.status(400).json({ error: `Invalid category. Must be one of: ${allowedCategories.join(", ")}` });
      }
      filter.category = category;
    }

    // Case-insensitive partial match by name (?search=Coding)
    if (search) filter.name = { $regex: search, $options: "i" };

    // Query
    let cursor = db.collection("clubs").find(filter);

    // Optional sorting (?sort=alphabetical/date/featured)
    if (sort === "alphabetical") cursor = cursor.sort({ name: 1 });
    if (sort === "featured") cursor = cursor.sort({ featured: -1 });
    if (sort === "date") cursor = cursor.sort({ createdAt: -1 });

    const orgs = await cursor.toArray();
    res.status(200).json({ orgs });
  } catch (err) {
    console.error("Get all orgs error:", err);
    res.status(500).json({ error: "Failed to fetch organizations" });
  }
};


// ==============================================
// GET /api/orgs/:name
// Get a single organization by its name
// ==============================================
exports.getOrgByName = async (req, res) => {
  try {
    const db = getDB();
    const orgName = decodeURIComponent(req.params.name);

    const org = await db.collection("clubs").findOne({ name: orgName });
    if (!org) return res.status(404).json({ error: "Organization not found" });

    res.status(200).json(org);
  } catch (err) {
    console.error("Get org by name error:", err);

    res.status(500).json({ error: "Failed to fetch organization" });
  }
};


// ==============================================
// POST /api/orgs
// Create a new organization (officer/admin only)
// ==============================================
exports.createOrg = async (req, res) => {
  try {
    const db = getDB();
    const { name, logo, category } = req.body;

    // Validate required fields
    if (!name || !category) {
      return res.status(400).json({ error: "Name and category are required" });
    }

    // Validate category
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ error: `Invalid category. Must be one of: ${allowedCategories.join(", ")}` });
    }

    // Check for duplicate org name
    const existing = await db.collection("clubs").findOne({ name });
    if (existing) {
      return res.status(400).json({ error: "Organization name already exists" });
    }

    const newOrg = {
      name,
      logo: logo || "/ucf-knight-placeholder.png",
      category,
      createdAt: new Date(),
      featured: false,
    };

    const result = await db.collection("clubs").insertOne(newOrg);
    res.status(201).json({
      message: "Organization created successfully",
      organization: { _id: result.insertedId, ...newOrg },
    });
  } catch (err) {
    console.error("Create org error:", err);
    res.status(500).json({ error: "Failed to create organization" });
  }
};


// ==============================================
// PATCH /api/orgs/:name
// Update an existing organization (officer/admin only)
// ==============================================
exports.updateOrgByName = async (req, res) => {
  try {
    const db = getDB();
    const orgName = decodeURIComponent(req.params.name);
    const updates = req.body;

    const result = await db
      .collection("clubs")
      .findOneAndUpdate(
        { name: orgName },
        { $set: updates },
        { returnDocument: "after" }
      );

    if (!result.value)
      return res.status(404).json({ error: "Organization not found" });

    res
      .status(200)
      .json({ message: "Organization updated", organization: result.value });
  } catch (err) {
    console.error("Update org error:", err);
    res.status(500).json({ error: "Failed to update organization" });
  }
};

// ==============================================
// DELETE /api/orgs/:name
// Delete organization by name (officer/admin only)
// ==============================================
exports.deleteOrgByName = async (req, res) => {
  try {
    const db = getDB();
    const orgName = decodeURIComponent(req.params.name);

    const result = await db.collection("clubs").deleteOne({ name: orgName });
    if (!result.deletedCount)
      return res.status(404).json({ error: "Organization not found" });

    res.status(200).json({ message: "Organization deleted" });
  } catch (err) {
    console.error("Delete org error:", err);
    res.status(500).json({ error: "Failed to delete organization" });
  }
};

// ==============================================
// POST /api/orgs/:name/join
// User joins organization (must be logged in)
// ==============================================
exports.joinOrg = async (req, res) => {
  try {
    const db = getDB();
    const orgName = decodeURIComponent(req.params.name);
    const userId = req.user?.id;

    const org = await db.collection("clubs").findOne({ name: orgName });
    if (!org) return res.status(404).json({ error: "Organization not found" });

    await db.collection("users").updateOne(
      { _id: new ObjectId(String(userId)) },
      { $addToSet: { clubsjoined: orgName } } // store org by name
    );

    res.status(200).json({ message: `Joined ${orgName} successfully` });
  } catch (err) {
    console.error("Join org error:", err);
    res.status(500).json({ error: "Failed to join organization" });
  }
};

// ==============================================
// POST /api/orgs/:name/leave
// User leaves organization (must be logged in)
// ==============================================
exports.leaveOrg = async (req, res) => {
  try {
    const db = getDB();
    const orgName = decodeURIComponent(req.params.name);
    const userId = req.user?.id;

    const org = await db.collection("clubs").findOne({ name: orgName });
    if (!org) return res.status(404).json({ error: "Organization not found" });

    await db.collection("users").updateOne(
      { _id: new ObjectId(String(userId)) },
      { $pull: { clubsjoined: orgName } }
    );

    res.status(200).json({ message: `Left ${orgName} successfully` });
  } catch (err) {
    console.error("Leave org error:", err);
    res.status(500).json({ error: "Failed to leave organization" });
  }
};
