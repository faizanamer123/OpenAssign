const express = require("express");
const {
  getSubmissions,
  createSubmission,
  rateSubmission,
} = require("../controllers/submissionController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// File upload setup
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.get("/", getSubmissions);
router.post("/", upload.single("file"), createSubmission);
router.patch("/:id/rate", rateSubmission);

module.exports = router;
