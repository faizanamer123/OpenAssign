const { db } = require("../database/sqlite");

const getLeaderboard = (req, res) => {
  const sort = req.query.sort === "rating" ? "rating" : "points";

  const users = db.prepare("SELECT * FROM users").all();

  // Get all rated submissions
  const allRatedSubs = db
    .prepare(
      "SELECT submittedBy, rating FROM submissions WHERE rating IS NOT NULL"
    )
    .all();

  // Points logic: points = rating * 3 (5=15, 4=12, 3=9, 2=6, 1=3)
  const userStats = {};

  allRatedSubs.forEach((sub) => {
    if (!userStats[sub.submittedBy]) {
      userStats[sub.submittedBy] = { points: 0, ratings: [] };
    }
    userStats[sub.submittedBy].points += Number(sub.rating) * 3;
    userStats[sub.submittedBy].ratings.push(Number(sub.rating));
  });

  // Assign stats to each user
  const leaderboard = users.map((u) => {
    const stats = userStats[u.id] || { points: 0, ratings: [] };
    const totalRatings = stats.ratings.length;
    const averageRating = totalRatings
      ? stats.ratings.reduce((a, b) => a + b, 0) / totalRatings
      : 0;

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
    if (sort === "rating") {
      if (b.averageRating !== a.averageRating)
        return b.averageRating - a.averageRating;
      return b.points - a.points;
    } else {
      if (b.points !== a.points) return b.points - a.points;
      return b.averageRating - a.averageRating;
    }
  });

  // Add rank
  leaderboard.forEach((u, i) => {
    u.rank = i + 1;
  });

  res.json(leaderboard);
};

module.exports = {
  getLeaderboard,
};
