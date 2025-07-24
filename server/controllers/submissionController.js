const { db } = require("../database/sqlite");

const getSubmissions = (req, res) => {
  const { assignmentId, userId } = req.query;
  let rows;

  if (assignmentId) {
    rows = db
      .prepare("SELECT * FROM submissions WHERE assignmentId = ?")
      .all(assignmentId);
  } else if (userId) {
    rows = db
      .prepare("SELECT * FROM submissions WHERE submittedBy = ?")
      .all(userId);
  } else {
    rows = db.prepare("SELECT * FROM submissions").all();
  }

  res.json(rows);
};

const createSubmission = async (req, res) => {
  const {
    assignmentId,
    submittedBy,
    submittedByUsername,
    explanation,
    rating,
    ratedBy,
  } = req.body;

  if (
    !assignmentId ||
    !submittedBy ||
    !submittedByUsername ||
    (!explanation && !req.file)
  ) {
    res.status(400).json({
      error: "Please provide either a text explanation or upload a file.",
    });
    return;
  }

  let fileUrl = "";
  if (req.file) {
    fileUrl = `/uploads/${req.file.filename}`;
  }

  const id = Date.now().toString();

  db.prepare(
    `INSERT INTO submissions (id, assignmentId, submittedBy, submittedByUsername, fileUrl, explanation, submittedAt, rating, ratedBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    assignmentId,
    submittedBy,
    submittedByUsername,
    fileUrl,
    explanation,
    new Date().toISOString(),
    rating || null,
    ratedBy || null
  );

  const row = db.prepare("SELECT * FROM submissions WHERE id = ?").get(id);

  // Notify assignment creator
  try {
    const assignment = db
      .prepare("SELECT * FROM assignments WHERE id = ?")
      .get(assignmentId);

    if (assignment) {
      const creator = db
        .prepare("SELECT * FROM users WHERE id = ?")
        .get(assignment.createdBy);

      if (creator && creator.email) {
        const assignmentUrl = `http://localhost:3000/assignment/${assignment.id}`;
        const subject = `Your assignment "${assignment.title}" has been solved!`;
        const message = `Hi ${creator.username},\n\nGood news! Your assignment "${assignment.title}" has received a new solution.\n\nYou can review and download the solution here: ${assignmentUrl}\n\nThank you for using OpenAssign!\n\nBest regards,\nThe OpenAssign Team`;
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #fcfbf8; border-radius: 8px; border: 1px solid #e9e2ce; padding: 32px;">
            <h2 style="color: #1c180d;">🎉 Your assignment has been solved!</h2>
            <p style="color: #9e8747;">Hi <b>${creator.username}</b>,</p>
            <p style="color: #1c180d;">Good news! Your assignment <b>\"${assignment.title}\"</b> has received a new solution.</p>
            <a href="${assignmentUrl}" style="display: inline-block; margin: 24px 0; padding: 12px 24px; background: linear-gradient(90deg, #fac638, #e6b332); color: #1c180d; border-radius: 6px; text-decoration: none; font-weight: bold;">View Solution</a>
            <p style="color: #9e8747;">Thank you for using <b>OpenAssign</b>!<br/>Best regards,<br/>The OpenAssign Team</p>
          </div>
        `;
        // TODO: Add actual email sending logic
      }
    }
  } catch (e) {
    console.error("Failed to send solved notification email:", e);
  }

  res.status(201).json(row);
};

const rateSubmission = (req, res) => {
  const { rating, raterId } = req.body;

  const submission = db
    .prepare("SELECT * FROM submissions WHERE id = ?")
    .get(req.params.id);

  if (!submission) {
    res.status(404).json({ error: "Submission not found" });
    return;
  }

  const parsedRating = parseInt(rating, 10);
  if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    res.status(400).json({ error: "Invalid rating value" });
    return;
  }

  db.prepare("UPDATE submissions SET rating = ?, ratedBy = ? WHERE id = ?").run(
    parsedRating,
    raterId,
    req.params.id
  );

  const updatedSubmission = db
    .prepare("SELECT * FROM submissions WHERE id = ?")
    .get(req.params.id);

  const solver = db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(submission.submittedBy);

  if (!solver) {
    res.status(404).json({ error: "Solver user not found" });
    return;
  }

  const newTotalRatings = (solver.totalRatings || 0) + 1;
  const newRatingSum = (solver.ratingSum || 0) + parsedRating;
  const newAverageRating = newRatingSum / newTotalRatings;

  db.prepare(
    "UPDATE users SET totalRatings = ?, ratingSum = ?, averageRating = ? WHERE id = ?"
  ).run(newTotalRatings, newRatingSum, newAverageRating, solver.id);

  res.json({ success: true });
};

module.exports = {
  getSubmissions,
  createSubmission,
  rateSubmission,
};
