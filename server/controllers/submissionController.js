const { db } = require("../database/sqlite");
const { uploadFileToS3, getFileFromS3 } = require("../aws/s3Utils");
const { awsFolders } = require("../aws/s3Client");
const path = require("path");

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
  let awsfileKey = "";
  let awsFileUrl = "";
  if (req.file) {
    fileUrl = `/uploads/${req.file.filename}`;
    awsFileUrl = await uploadFileToS3(
      path.join(__dirname, "../uploads", req.file.filename),
      `${awsFolders.submissions}/${req.file.filename}`
    );
    awsfileKey = `${awsFolders.submissions}/${req.file.filename}`;
  }

  const id = Date.now().toString();

  db.prepare(
    `INSERT INTO submissions (id, assignmentId, submittedBy, submittedByUsername, fileUrl, explanation, submittedAt, rating, ratedBy, awsfileKey, awsfileUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    assignmentId,
    submittedBy,
    submittedByUsername,
    fileUrl,
    explanation,
    new Date().toISOString(),
    rating || null,
    ratedBy || null,
    awsfileKey,
    awsFileUrl
  );

  const row = db.prepare("SELECT * FROM submissions WHERE id = ?").get(id);

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

const downloadSubmission = (req, res) => {
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
    "SELECT awsfileKey FROM submissions WHERE id = ?"
  );
  const submission = fileQuery.get(fileId);

  if (!submission) {
    return res.status(404).send("Submissions not found");
  }

  if (!submission.awsfileKey) {
    return res.status(404).send("Submission has no file attached");
  }

  try {
    getFileFromS3(submission.awsfileKey, res);
  } catch (error) {
    console.error("Error in getFileFromS3:", error);
    res.status(500).send("Error retrieving file from S3");
  }
};

module.exports = {
  getSubmissions,
  createSubmission,
  rateSubmission,
  downloadSubmission,
};