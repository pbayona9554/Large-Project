// GET /api/orgs — Get all orgs
export const getOrgs = async (req, res) => {
  try {
    const orgs = await Org.find();
    res.json(orgs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orgs/:id — Get single org
export const getOrg = async (req, res) => {
  try {
    const org = await Org.findById(req.params.id);
    if (!org) return res.status(404).json({ message: "Organization not found" });
    res.json(org);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/orgs — Create new org
export const createOrg = async (req, res) => {
  try {
    const org = new Org(req.body);
    await org.save();
    res.status(201).json(org);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PATCH /api/orgs/:id — Update org
export const updateOrg = async (req, res) => {
  try {
    const org = await Org.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!org) return res.status(404).json({ message: "Organization not found" });
    res.json(org);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
