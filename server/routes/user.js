const express = require("express");
const { getLeaderboard } = require("../controllers/leaderboardController");
const {
  getUsers,
  getUserById,
  createUser,
} = require("../controllers/userController");

const { body, validationResult } = require("express-validator");

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post(
  "/",
  [
    body("username").isString().trim().isLength({ min: 1, max: 100 }),
    body("email").isEmail().normalizeEmail(),
    body("points").optional().isInt({ min: 0 }),
  ],
  createUser
);

module.exports = router;
