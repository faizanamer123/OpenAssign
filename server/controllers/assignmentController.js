const { db } = require("../database/sqlite");

const getAssignments = (req, res) => {
  // Remove expired, unsolved assignments
  const now = new Date().toISOString();
  db.prepare(
    `DELETE FROM assignments WHERE deadline < ? AND status != 'solved'`
  ).run(now);

  const rows = db
    .prepare("SELECT * FROM assignments ORDER BY createdAt DESC")
    .all();

  res.json(rows);
};

const getAssignmentById = (req, res) => {
  const row = db
    .prepare("SELECT * FROM assignments WHERE id = ?")
    .get(req.params.id);

  if (!row) return res.status(404).json({ error: "Not found" });

  res.json(row);
};

const createAssignment = (req, res) => {
  // Validate fields manually since express-validator won't work with multipart/form-data
  const {
    title,
    description,
    difficulty,
    deadline,
    createdBy,
    createdByUsername,
    subject,
  } = req.body;

  if (
    !title ||
    !description ||
    !difficulty ||
    !deadline ||
    !createdBy ||
    !createdByUsername
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let fileUrl = "";
  if (req.file) {
    fileUrl = `/uploads/${req.file.filename}`;
  }

  const id = Date.now().toString();

  db.prepare(
    `INSERT INTO assignments (id, title, description, difficulty, deadline, status, createdBy, createdByUsername, subject, fileUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    title,
    description,
    difficulty,
    deadline,
    "pending",
    createdBy,
    createdByUsername,
    subject,
    fileUrl,
    new Date().toISOString()
  );

  const row = db.prepare("SELECT * FROM assignments WHERE id = ?").get(id);

  res.status(201).json(row);
};

const downloadAssignmentFile = (req, res) => {
  const { email, filePath } = req.query;

  if (!filePath) {
    return res.status(400).send("Missing filePath");
  }

  const query = db.prepare("SELECT * FROM users WHERE email = ?");
  const user = query.get(email);

  if (!user) {
    return res.status(400).send("User not found");
  }

  return res.download(`./${filePath}`, (err) => {
    if (err) {
      console.error("Download error:", err);
      return res.status(500).json({ error: "Failed to download file" });
    }
  });
};

module.exports = {
  getAssignments,
  getAssignmentById,
  createAssignment,
  downloadAssignmentFile,
};
