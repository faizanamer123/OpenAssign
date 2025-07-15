const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');
const crypto = require('crypto');
const axios = require('axios'); 
require('dotenv').config();

const app = express();
const PORT = 4000;

// CORS should be the very first middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PATCH", "OPTIONS"],
}));
// Increase rate limit
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000, // scalable 
  standardHeaders: true,
  legacyHeaders: false,
}));
app.use(bodyParser.json());

// SQLite 
const db = new Database(path.join(__dirname, 'db.sqlite'));

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

const userTableColumns = db.prepare("PRAGMA table_info(users)").all().map(col => col.name);
if (!userTableColumns.includes("totalRatings")) {
  db.prepare("ALTER TABLE users ADD COLUMN totalRatings INTEGER DEFAULT 0").run();
}
if (!userTableColumns.includes("ratingSum")) {
  db.prepare("ALTER TABLE users ADD COLUMN ratingSum INTEGER DEFAULT 0").run();
}
if (!userTableColumns.includes("averageRating")) {
  db.prepare("ALTER TABLE users ADD COLUMN averageRating REAL DEFAULT 0").run();
}
// one-time OTP verification
if (!userTableColumns.includes("emailVerified")) {
  db.prepare("ALTER TABLE users ADD COLUMN emailVerified INTEGER DEFAULT 0").run();
}

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP email using EmailJS
async function sendOTPEmail(email, otp) {
  try {
    const userName = email.split('@')[0];
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY; // <-- Use public key
    const payload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey, // <-- Use public key here
      template_params: {
        user_name: userName,
        otp_code: otp,
        to_email: email
      }
    };
    const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to send OTP email via EmailJS:', error?.response?.data || error);
    throw error;
  }
}

// File upload setup
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

app.use('/uploads', express.static(uploadDir));

// --- OTP Endpoints ---
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  try {
    // Check if user already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser && existingUser.emailVerified === 1) {
      // User is already verified, do not generate OTP
      return res.json({
        message: 'User already verified',
        userExists: true,
        user: existingUser,
        otpNeeded: false
      });
    }
    // Generate OTP for all users (new and existing)
    const otp = generateOTP();
    const otpId = Date.now().toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes
    // Store OTP in database
    db.prepare('INSERT INTO otp_verification (id, email, otp, expiresAt, createdAt) VALUES (?, ?, ?, ?, ?)')
      .run(otpId, email, otp, expiresAt, new Date().toISOString());
    // Do NOT send OTP email from backend anymore
    // Instead, return the OTP to the frontend for EmailJS
    res.json({ 
      message: 'OTP generated successfully', 
      otpId,
      otp, // <-- Return OTP for frontend to use
      userExists: !!existingUser,
      user: existingUser || null,
      otpNeeded: true
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to generate OTP' });
  }
});

app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }
  
  try {
    // Find the most recent OTP for this email
    const otpRecord = db.prepare('SELECT * FROM otp_verification WHERE email = ? ORDER BY createdAt DESC LIMIT 1').get(email);
    
    if (!otpRecord) {
      return res.status(400).json({ error: 'No OTP found for this email' });
    }
    
    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expiresAt)) {
      return res.status(400).json({ error: 'OTP has expired' });
    }
    
    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    // Delete the used OTP
    db.prepare('DELETE FROM otp_verification WHERE id = ?').run(otpRecord.id);

    // Check if user exists and return user data
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    // Mark user as verified if exists
    if (existingUser) {
      db.prepare('UPDATE users SET emailVerified = 1 WHERE email = ?').run(email);
    }
    res.json({ 
      message: 'OTP verified successfully',
      userExists: !!existingUser,
      user: existingUser
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// --- Assignments ---
app.get('/assignments', (req, res) => {
  // Remove expired, unsolved assignments
  const now = new Date().toISOString();
  db.prepare(`DELETE FROM assignments WHERE deadline < ? AND status != 'solved'`).run(now);
  const rows = db.prepare('SELECT * FROM assignments ORDER BY createdAt DESC').all();
  res.json(rows);
});
app.get('/assignments/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM assignments WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});
app.post('/assignments', upload.single('file'), (req, res) => {
  // Validate fields manually since express-validator won't work with multipart/form-data
  const { title, description, difficulty, deadline, createdBy, createdByUsername, subject } = req.body;
  if (!title || !description || !difficulty || !deadline || !createdBy || !createdByUsername) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let fileUrl = '';
  if (req.file) {
    fileUrl = `/uploads/${req.file.filename}`;
  }

  const id = Date.now().toString();
  db.prepare(`INSERT INTO assignments (id, title, description, difficulty, deadline, status, createdBy, createdByUsername, subject, fileUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, title, description, difficulty, deadline, 'pending', createdBy, createdByUsername, subject, fileUrl, new Date().toISOString());
  const row = db.prepare('SELECT * FROM assignments WHERE id = ?').get(id);
  res.status(201).json(row);
});

// --- Submissions ---
app.get('/submissions', (req, res) => {
  const { assignmentId, userId } = req.query;
  let rows;
  if (assignmentId) {
    rows = db.prepare('SELECT * FROM submissions WHERE assignmentId = ?').all(assignmentId);
  } else if (userId) {
    rows = db.prepare('SELECT * FROM submissions WHERE submittedBy = ?').all(userId);
  } else {
    rows = db.prepare('SELECT * FROM submissions').all();
  }
  res.json(rows);
});
app.post('/submissions', upload.single('file'), async (req, res) => {
  // Validate fields manually since express-validator won't work with multipart/form-data
  const { assignmentId, submittedBy, submittedByUsername, explanation, rating, ratedBy } = req.body;
  if (!assignmentId || !submittedBy || !submittedByUsername || (!explanation && !req.file)) {
    return res.status(400).json({ error: 'Please provide either a text explanation or upload a file.' });
  }

  let fileUrl = '';
  if (req.file) {
    fileUrl = `/uploads/${req.file.filename}`;
  }

  const id = Date.now().toString();
  db.prepare(`INSERT INTO submissions (id, assignmentId, submittedBy, submittedByUsername, fileUrl, explanation, submittedAt, rating, ratedBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, assignmentId, submittedBy, submittedByUsername, fileUrl, explanation, new Date().toISOString(), rating || null, ratedBy || null);
  const row = db.prepare('SELECT * FROM submissions WHERE id = ?').get(id);
  // Notify assignment creator by email (polished)
  try {
    const assignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(assignmentId);
    if (assignment) {
      const creator = db.prepare('SELECT * FROM users WHERE id = ?').get(assignment.createdBy);
      if (creator && creator.email) {
        const assignmentUrl = `http://localhost:3000/assignment/${assignment.id}`;
        const subject = `Your assignment "${assignment.title}" has been solved!`;
        const message = `Hi ${creator.username},\n\nGood news! Your assignment "${assignment.title}" has received a new solution.\n\nYou can review and download the solution here: ${assignmentUrl}\n\nThank you for using OpenAssign!\n\nBest regards,\nThe OpenAssign Team`;
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #fcfbf8; border-radius: 8px; border: 1px solid #e9e2ce; padding: 32px;">
            <h2 style="color: #1c180d;">🎉 Your assignment has been solved!</h2>
            <p style="color: #9e8747;">Hi <b>${creator.username}</b>,</p>
            <p style="color: #1c180d;">Good news! Your assignment <b>"${assignment.title}"</b> has received a new solution.</p>
            <a href="${assignmentUrl}" style="display: inline-block; margin: 24px 0; padding: 12px 24px; background: linear-gradient(90deg, #fac638, #e6b332); color: #1c180d; border-radius: 6px; text-decoration: none; font-weight: bold;">View Solution</a>
            <p style="color: #9e8747;">Thank you for using <b>OpenAssign</b>!<br/>Best regards,<br/>The OpenAssign Team</p>
          </div>
        `;
      }
    }
  } catch (e) {
    console.error('Failed to send solved notification email:', e);
  }
  res.status(201).json(row);
});
app.patch('/submissions/:id/rate', (req, res) => {
  const { rating, raterId } = req.body;
  const submission = db.prepare('SELECT * FROM submissions WHERE id = ?').get(req.params.id);
  if (!submission) return res.status(404).json({ error: 'Submission not found' });

  // Validate rating
  const parsedRating = parseInt(rating, 10);
  if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return res.status(400).json({ error: 'Invalid rating value' });
  }

  console.log('DEBUG: Storing rating', parsedRating, 'for submission', req.params.id);

  db.prepare('UPDATE submissions SET rating = ?, ratedBy = ? WHERE id = ?').run(parsedRating, raterId, req.params.id);

  const updatedSubmission = db.prepare('SELECT * FROM submissions WHERE id = ?').get(req.params.id);
  console.log('DEBUG: Updated submission:', updatedSubmission);

  // Award points and update rating stats for solver
  const solver = db.prepare('SELECT * FROM users WHERE id = ?').get(submission.submittedBy);
  if (!solver) {
    return res.status(404).json({ error: 'Solver user not found' });
  }
  // Remove points update: points are now calculated dynamically from submissions
  const newTotalRatings = (solver.totalRatings || 0) + 1;
  const newRatingSum = (solver.ratingSum || 0) + parsedRating;
  const newAverageRating = newRatingSum / newTotalRatings;
  db.prepare('UPDATE users SET totalRatings = ?, ratingSum = ?, averageRating = ? WHERE id = ?')
    .run(newTotalRatings, newRatingSum, newAverageRating, solver.id);

  res.json({ success: true });
});

// Notifications
app.get('/notifications', (req, res) => {
  const { userId } = req.query;
  let rows;
  if (userId) {
    rows = db.prepare('SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC').all(userId);
  } else {
    rows = db.prepare('SELECT * FROM notifications ORDER BY createdAt DESC').all();
  }
  res.json(rows);
});
app.post('/notifications',
  [
    body('userId').isString().trim().isLength({ min: 1, max: 100 }),
    body('type').isString().trim().isLength({ min: 1, max: 50 }),
    body('title').isString().trim().isLength({ min: 1, max: 100 }),
    body('message').isString().trim().isLength({ min: 1, max: 1000 }),
    body('read').optional().isBoolean(),
    body('assignmentId').optional().isString().trim().isLength({ max: 100 }),
    body('submissionId').optional().isString().trim().isLength({ max: 100 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const n = req.body;
    const id = Date.now().toString();
    db.prepare(`INSERT INTO notifications (id, userId, type, title, message, read, createdAt, assignmentId, submissionId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, n.userId, n.type, n.title, n.message, n.read ? 1 : 0, new Date().toISOString(), n.assignmentId || null, n.submissionId || null);
    const row = db.prepare('SELECT * FROM notifications WHERE id = ?').get(id);
    res.status(201).json(row);
  }
);
app.patch('/notifications/:id/read', (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Users
app.get('/users', (req, res) => {
  const rows = db.prepare('SELECT * FROM users').all();
  res.json(rows);
});
app.get('/users/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});
app.post('/users',
  [
    body('username').isString().trim().isLength({ min: 1, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('points').optional().isInt({ min: 0 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const u = req.body;
    
    // Check if user with this email already exists
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(u.email);
    if (existing) {
      return res.status(200).json(existing);
    }
    
    // Create new user (OTP verification already done in frontend)
    const id = u.id || Date.now().toString();
    db.prepare(`INSERT INTO users (id, username, email, points, createdAt) VALUES (?, ?, ?, ?, ?)`).run(id, u.username, u.email, u.points || 0, new Date().toISOString());
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    res.status(201).json(row);
  }
);
// Leaderboard (dynamic calculation from submissions)
app.get('/leaderboard', (req, res) => {
  const sort = req.query.sort === 'rating' ? 'rating' : 'points';
  const users = db.prepare('SELECT * FROM users').all();
  // Get all rated submissions
  const allRatedSubs = db.prepare('SELECT submittedBy, rating FROM submissions WHERE rating IS NOT NULL').all();
  // Points logic: points = rating * 3 (5=15, 4=12, 3=9, 2=6, 1=3)
  const userStats = {};
  allRatedSubs.forEach(sub => {
    if (!userStats[sub.submittedBy]) {
      userStats[sub.submittedBy] = { points: 0, ratings: [] };
    }
    userStats[sub.submittedBy].points += Number(sub.rating) * 3;
    userStats[sub.submittedBy].ratings.push(Number(sub.rating));
  });
  // Assign stats to each user
  const leaderboard = users.map(u => {
    const stats = userStats[u.id] || { points: 0, ratings: [] };
    const totalRatings = stats.ratings.length;
    const averageRating = totalRatings ? (stats.ratings.reduce((a, b) => a + b, 0) / totalRatings) : 0;
    return {
      id: u.id,
      username: u.username,
      points: stats.points,
      averageRating,
      totalRatings,
      assignmentsSolved: totalRatings,
    };
  });
  // Sort by selected metric
  leaderboard.sort((a, b) => {
    if (sort === 'rating') {
      if (b.averageRating !== a.averageRating) return b.averageRating - a.averageRating;
      return b.points - a.points;
    } else {
      if (b.points !== a.points) return b.points - a.points;
      return b.averageRating - a.averageRating;
    }
  });
  leaderboard.forEach((u, i) => { u.rank = i + 1; });
  res.json(leaderboard);
});

// --- Analytics ---
app.get('/analytics', (req, res) => {
  // Total users
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  // Total assignments
  const totalAssignments = db.prepare('SELECT COUNT(*) as count FROM assignments').get().count;
  // Assignments solved (at least one rated submission)
  const solvedAssignments = db.prepare('SELECT COUNT(DISTINCT assignmentId) as count FROM submissions WHERE rating IS NOT NULL').get().count;
  // Average rating
  const avgRatingRow = db.prepare('SELECT AVG(rating) as avg FROM submissions WHERE rating IS NOT NULL').get();
  const averageRating = avgRatingRow && avgRatingRow.avg ? parseFloat(avgRatingRow.avg).toFixed(2) : 0;
  // Assignments uploaded per day (last 14 days)
  const uploadsPerDay = db.prepare(`SELECT DATE(createdAt) as date, COUNT(*) as count FROM assignments WHERE createdAt >= DATE('now', '-13 days') GROUP BY DATE(createdAt) ORDER BY date ASC`).all();
  // Ratings distribution (1-5 stars)
  const ratingsDist = db.prepare(`SELECT rating, COUNT(*) as count FROM submissions WHERE rating IS NOT NULL GROUP BY rating`).all();
  // Top 5 users by points
  const topUsers = db.prepare('SELECT username, points FROM users ORDER BY points DESC LIMIT 5').all();
  res.json({
    totalUsers,
    totalAssignments,
    solvedAssignments,
    averageRating,
    uploadsPerDay,
    ratingsDist,
    topUsers,
  });
});

// --- Error handling middleware ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 