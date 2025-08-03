const { db } = require("../database/sqlite");
const { awsFolders } = require("../aws/s3Client");
const fs = require("fs");
const path = require("path");
const { uploadFileToS3, getFileFromS3 } = require("../aws/s3Utils");
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

const createAssignment = async (req, res) => {
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

  let awsFileUrl = "-";
  let awsfileKey = null;

  if (req.file) {
    awsFileUrl = await uploadFileToS3(
      path.join(__dirname, "../uploads", req.file.filename),
      `${awsFolders.assignments}/${req.file.filename}`
    );
    awsfileKey = `${awsFolders.assignments}/${req.file.filename}`;
  }

  const id = Date.now().toString();

  db.prepare(
    `INSERT INTO assignments (id, title, description, difficulty, deadline, status, createdBy, createdByUsername, subject, awsfileUrl, awsfileKey, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
    awsFileUrl,
    awsfileKey,
    new Date().toISOString()
  );

  const row = db.prepare("SELECT * FROM assignments WHERE id = ?").get(id);

  res.status(201).json(row);
};

const downloadAssignmentFile = (req, res) => {
  const { email, fileId } = req.query;

  if (!email || !fileId) {
    return res.status(400).send("Missing email or fileId");
  }

  const query = db.prepare("SELECT * FROM users WHERE email = ?");
  const user = query.get(email);

  if (!user) {
    return res.status(400).send("User not found");
  }

  const fileQuery = db.prepare(
    "SELECT awsfileKey FROM assignments WHERE id = ?"
  );
  const assignment = fileQuery.get(fileId);

  if (!assignment) {
    return res.status(404).send("Assignment not found");
  }

  if (!assignment.awsfileKey) {
    return res.status(404).send("Assignment has no file attached");
  }

  try {
    getFileFromS3(assignment.awsfileKey, res);
  } catch (error) {
    console.error("Error in getFileFromS3:", error);
    res.status(500).send("Error retrieving file from S3");
  }
};

module.exports = {
  getAssignments,
  getAssignmentById,
  createAssignment,
  downloadAssignmentFile,
};
