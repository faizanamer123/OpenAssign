const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const Database = require("better-sqlite3");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");
const { body, validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const multer = require("multer");
const fs = require("fs");
const crypto = require("crypto");
const axios = require("axios");
const dotenv = require("dotenv");
const { db } = require("./database/sqlite");

dotenv.config();

const assignmentRoutes = require("./routes/assignment");
const leaderboardRoutes = require("./routes/leaderboard");
const analyticsRoutes = require("./routes/analytics");
const userRoutes = require("./routes/user");
const notificationRoutes = require("./routes/notification");
const submissionRoutes = require("./routes/submission");
const otpRoutes = require("./routes/otp");

const app = express();
const PORT = 4000;

// CORS should be the very first middleware
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
  })
);
// Increase rate limit
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 2000, // scalable
    standardHeaders: true,
    legacyHeaders: false,
  })
);
app.use(bodyParser.json());

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT,
  email TEXT,
  points INTEGER DEFAULT 0,
  createdAt TEXT
);
CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  difficulty TEXT,
  deadline TEXT,
  status TEXT,
  createdBy TEXT,
  createdByUsername TEXT,
  subject TEXT,
  fileUrl TEXT,
  createdAt TEXT
);
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  assignmentId TEXT,
  submittedBy TEXT,
  submittedByUsername TEXT,
  fileUrl TEXT,
  explanation TEXT,
  submittedAt TEXT,
  rating INTEGER,
  ratedBy TEXT
);
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  userId TEXT,
  type TEXT,
  title TEXT,
  message TEXT,
  read INTEGER DEFAULT 0,
  createdAt TEXT,
  assignmentId TEXT,
  submissionId TEXT
);
CREATE TABLE IF NOT EXISTS otp_verification (
  id TEXT PRIMARY KEY,
  email TEXT,
  otp TEXT,
  expiresAt TEXT,
  createdAt TEXT
);
`);

const userTableColumns = db
  .prepare("PRAGMA table_info(users)")
  .all()
  .map((col) => col.name);
if (!userTableColumns.includes("totalRatings")) {
  db.prepare(
    "ALTER TABLE users ADD COLUMN totalRatings INTEGER DEFAULT 0"
  ).run();
}
if (!userTableColumns.includes("ratingSum")) {
  db.prepare("ALTER TABLE users ADD COLUMN ratingSum INTEGER DEFAULT 0").run();
}
if (!userTableColumns.includes("averageRating")) {
  db.prepare("ALTER TABLE users ADD COLUMN averageRating REAL DEFAULT 0").run();
}
// one-time OTP verification
if (!userTableColumns.includes("emailVerified")) {
  db.prepare(
    "ALTER TABLE users ADD COLUMN emailVerified INTEGER DEFAULT 0"
  ).run();
}

// File upload setup
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use("/uploads", express.static(uploadDir));

app.use("/assignments", assignmentRoutes);
app.use("/leaderboard", leaderboardRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/users", userRoutes);
app.use("/notifications", notificationRoutes);
app.use("/submissions", submissionRoutes);
app.use("/otp", otpRoutes);

// --- Error handling middleware ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
