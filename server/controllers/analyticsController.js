const { db } = require("../database/sqlite");

const getAnalytics = (req, res) => {
  // Total users
  const totalUsers = db
    .prepare("SELECT COUNT(*) as count FROM users")
    .get().count;

  // Total assignments
  const totalAssignments = db
    .prepare("SELECT COUNT(*) as count FROM assignments")
    .get().count;

  // Assignments solved (at least one rated submission)
  const solvedAssignments = db
    .prepare(
      "SELECT COUNT(DISTINCT assignmentId) as count FROM submissions WHERE rating IS NOT NULL"
    )
    .get().count;

  // Average rating
  const avgRatingRow = db
    .prepare(
      "SELECT AVG(rating) as avg FROM submissions WHERE rating IS NOT NULL"
    )
    .get();
  const averageRating =
    avgRatingRow && avgRatingRow.avg
      ? parseFloat(avgRatingRow.avg).toFixed(2)
      : 0;

  // Assignments uploaded per day (last 14 days)
  const uploadsPerDay = db
    .prepare(
      `SELECT DATE(createdAt) as date, COUNT(*) as count FROM assignments WHERE createdAt >= DATE('now', '-13 days') GROUP BY DATE(createdAt) ORDER BY date ASC`
    )
    .all();

  // Ratings distribution (1–5 stars)
  const ratingsDist = db
    .prepare(
      `SELECT rating, COUNT(*) as count FROM submissions WHERE rating IS NOT NULL GROUP BY rating`
    )
    .all();

  // Top 5 users by points
  const topUsers = db
    .prepare("SELECT username, points FROM users ORDER BY points DESC LIMIT 5")
    .all();

  res.json({
    totalUsers,
    totalAssignments,
    solvedAssignments,
    averageRating,
    uploadsPerDay,
    ratingsDist,
    topUsers,
  });
};

module.exports = {
  getAnalytics,
};
