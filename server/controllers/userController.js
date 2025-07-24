const { db } = require("../database/sqlite");
const { validationResult } = require("express-validator");

const getUsers = (req, res) => {
  const rows = db.prepare("SELECT * FROM users").all();
  res.json(rows);
};

const getUserById = (req, res) => {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(row);
};

const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const u = req.body;

  // Check if user with this email already exists
  const existing = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(u.email);
  if (existing) {
    res.status(200).json(existing);
    return;
  }

  // Create new user (OTP verification already done in frontend)
  const id = u.id || Date.now().toString();
  db.prepare(
    "INSERT INTO users (id, username, email, points, createdAt) VALUES (?, ?, ?, ?, ?)"
  ).run(id, u.username, u.email, u.points || 0, new Date().toISOString());

  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  res.status(201).json(row);
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
};
