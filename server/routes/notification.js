const express = require("express");
const {
  getNotifications,
  createNotification,
  markNotificationRead,
} = require("../controllers/notificationController");

const { body } = require("express-validator");

const router = express.Router();

router.get("/", getNotifications);
router.post(
  "/",
  [
    body("userId").isString().trim().isLength({ min: 1, max: 100 }),
    body("type").isString().trim().isLength({ min: 1, max: 50 }),
    body("title").isString().trim().isLength({ min: 1, max: 100 }),
    body("message").isString().trim().isLength({ min: 1, max: 1000 }),
    body("read").optional().isBoolean(),
    body("assignmentId").optional().isString().trim().isLength({ max: 100 }),
    body("submissionId").optional().isString().trim().isLength({ max: 100 }),
  ],
  createNotification
);
router.patch("/:id/read", markNotificationRead);

module.exports = router;
