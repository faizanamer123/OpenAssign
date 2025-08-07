const { db } = require("../database/sqlite");
const { validationResult } = require("express-validator");

const getNotifications = (req, res) => {
  const { userId } = req.query;
  let rows;

  if (userId) {
    rows = db
      .prepare(
        "SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC"
      )
      .all(userId);
  } else {
    rows = db
      .prepare("SELECT * FROM notifications ORDER BY createdAt DESC")
      .all();
  }

  res.json(rows);
};

const createNotification = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const n = req.body;
  const id = Date.now().toString();

  db.prepare(
    "INSERT INTO notifications (id, userId, type, title, message, read, createdAt, assignmentId, submissionId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(
    id,
    n.userId,
    n.type,
    n.title,
    n.message,
    n.read ? 1 : 0,
    new Date().toISOString(),
    n.assignmentId || null,
    n.submissionId || null
  );

  const row = db.prepare("SELECT * FROM notifications WHERE id = ?").get(id);
  res.status(201).json(row);
};

const markNotificationRead = (req, res) => {
  db.prepare("UPDATE notifications SET read = 1 WHERE id = ?").run(
    req.params.id
  );
  res.json({ success: true });
};

module.exports = {
  getNotifications,
  createNotification,
  markNotificationRead,
};
