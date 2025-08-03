const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
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
