const path = require("path");
const Database = require("better-sqlite3");
const { alterColumnTable } = require("./utils/alter-table");

const db = new Database(path.join(__dirname, "../db.sqlite"));

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT,
      email TEXT,
      points INTEGER DEFAULT 0,
      createdAt TEXT,
      totalRatings INTEGER DEFAULT 0,
      ratingSum INTEGER DEFAULT 0,
      averageRating REAL DEFAULT 0,
      emailVerified INTEGER DEFAULT 0
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
      awsfileUrl TEXT,
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

alterColumnTable(
  db,
  `PRAGMA table_info(assignments);`,
  "awsfileKey",
  "assignments"
);
alterColumnTable(
  db,
  `PRAGMA table_info(submissions);`,
  "awsfileKey",
  "submissions"
);
alterColumnTable(
  db,
  `PRAGMA table_info(submissions);`,
  "awsfileUrl",
  "submissions"
);

module.exports = { db };
