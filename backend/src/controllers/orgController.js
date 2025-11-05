require("dotenv").config();

// GET /api/orgs
exports.getOrgs = async (req, res) => {
  const db = req.app.locals.db;
  try {
    const orgs = await db.collection("Orgs").find().toArray();
    res.status(200).json({ orgs });
  } catch (err) {
    console.error("getOrgs error:", err);
    res.status(500).json({ error: "Failed to fetch organizations" });
  }
};

// GET /api/orgs/:id
exports.getOrg = async (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  try {
    const org = await db.collection("Orgs").findOne({ _id: new require("mongodb").ObjectId(id) });
    if (!org) return res.status(404).json({ error: "Organization not found" });
    res.status(200).json({ org });
  } catch (err) {
    console.error("getOrg error:", err);
    res.status(500).json({ error: "Failed to fetch organization" });
  }
};

// POST /api/orgs
exports.createOrg = async (req, res) => {
  const db = req.app.locals.db;
  try {
    const newOrg = req.body;
    const result = await db.collection("Orgs").insertOne(newOrg);
    res.status(201).json({ message: "Organization created", orgId: result.insertedId });
  } catch (err) {
    console.error("createOrg error:", err);
    res.status(500).json({ error: "Failed to create organization" });
  }
};

// PATCH /api/orgs/:id
exports.updateOrg = async (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  try {
    const result = await db.collection("Orgs").updateOne(
      { _id: new require("mongodb").ObjectId(id) },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: "Organization not found" });
    res.status(200).json({ message: "Organization updated" });
  } catch (err) {
    console.error("updateOrg error:", err);
    res.status(500).json({ error: "Failed to update organization" });
  }
};