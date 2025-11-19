// src/controllers/orgController.js
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const allowedCategories = ["Tech", "Academic", "Sports", "Cultural", "Social"];

// ==============================================
// GET /api/orgs
// ==============================================
exports.getAllOrgs = async (req, res) => {
  try {
    const db = getDB();
    const { category, search, sort } = req.query;
    const filter = {};

    // Filter by category if valid
    if (category) {
      if (!allowedCategories.includes(category)) {
        return res
          .status(400)
          .json({
            error: `Invalid category. Must be one of: ${allowedCategories.join(", ")}`
          });
      }
      filter.category = category;
    }

    // Case-insensitive name search (?search=Coding)
    if (search) filter.name = { $regex: search, $options: "i" };

    // Query
    let cursor = db.collection("clubs").find(filter);

    // Optional sorting
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
// Create new organization (officer/admin only)
// ==============================================
exports.createOrg = async (req, res) => {
  try {
    const db = getDB();
    const { name, description, logo, category } = req.body;

    // Required fields
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Valid organization name is required." });
    }

    if (!category || typeof category !== "string") {
      return res.status(400).json({ error: "Valid category is required." });
    }

    // Validate allowed categories
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        error: `Invalid category. Must be one of: ${allowedCategories.join(", ")}`
      });
    }

    // Description validation (prevents undefined/null)
    const safeDescription =
      typeof description === "string" ? description.trim() : "";

    // Ensure no duplicate names
    const existing = await db.collection("clubs").findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ error: "Organization name already exists" });
    }

    // Build safe object (no undefined fields)
    const now = new Date();
    const newOrg = {
      name: name.trim(),
      description: safeDescription,
      category,
      logo: logo || "/ucf-knight-placeholder.png",
      featured: false,
      createdAt: now,
      updatedAt: now,
    };

    // Insert
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
// ==============================================
exports.updateOrgByName = async (req, res) => {
  try {
    const db = getDB();
    const orgName = decodeURIComponent(req.params.name);
    const updates = { ...req.body, updatedAt: new Date() };

    const result = await db
      .collection("clubs")
      .findOneAndUpdate(
        { name: orgName },
        { $set: updates },
        { returnDocument: "after" }
      );

    

    res.status(200).json({
      message: "Organization updated successfully",
      organization: result.value,
    });
  } catch (err) {
    console.error("Update org error:", err);
    res.status(500).json({ error: "Failed to update organization" });
  }
};

// ==============================================
// POST /api/orgs/:name/join
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
      { $addToSet: { clubsjoined: orgName } }
    );

    res.status(200).json({ message: `Joined ${orgName} successfully` });
  } catch (err) {
    console.error("Join org error:", err);
    res.status(500).json({ error: "Failed to join organization" });
  }
};

// ==============================================
// POST /api/orgs/:name/leave
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

exports.updateOrgById = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date() };

    const result = await db.collection("clubs").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: "after" }
    );

    if (!result.value)
      return res.status(404).json({ error: "Organization not found" });

    res.status(200).json({
      message: "Organization updated successfully",
      organization: result.value,
    });
  } catch (err) {
    console.error("Update org by ID error:", err);
    res.status(500).json({ error: "Failed to update organization" });
  }
};

exports.getCategories = (req, res) => res.json({ categories: allowedCategories });

exports.deleteOrgById = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    const result = await db.collection("clubs").deleteOne({
      _id: new ObjectId(id)
    });

    if (!result.deletedCount) {
      return res.status(404).json({ error: "Organization not found" });
    }

    res.status(200).json({ message: "Organization deleted successfully" });
  } catch (err) {
    console.error("Delete org by ID error:", err);
    res.status(500).json({ error: "Failed to delete organization" });
  }
};