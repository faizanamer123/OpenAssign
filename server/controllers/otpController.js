const { db } = require("../database/sqlite");

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  try {
    const existingUser = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email);

    if (existingUser && existingUser.emailVerified === 1) {
      res.json({
        message: "User already verified",
        userExists: true,
        user: existingUser,
        otpNeeded: false,
      });
      return;
    }

    const otp = generateOTP();
    const otpId = Date.now().toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    db.prepare(
      "INSERT INTO otp_verification (id, email, otp, expiresAt, createdAt) VALUES (?, ?, ?, ?, ?)"
    ).run(otpId, email, otp, expiresAt, new Date().toISOString());

    res.json({
      message: "OTP generated successfully",
      otpId,
      otp,
      userExists: !!existingUser,
      user: existingUser || null,
      otpNeeded: true,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ error: "Failed to generate OTP" });
  }
};

const verifyOtp = (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400).json({ error: "Email and OTP are required" });
    return;
  }

  try {
    const otpRecord = db
      .prepare(
        "SELECT * FROM otp_verification WHERE email = ? ORDER BY createdAt DESC LIMIT 1"
      )
      .get(email);

    if (!otpRecord) {
      res.status(400).json({ error: "No OTP found for this email" });
      return;
    }

    if (new Date() > new Date(otpRecord.expiresAt)) {
      res.status(400).json({ error: "OTP has expired" });
      return;
    }

    if (otpRecord.otp !== otp) {
      res.status(400).json({ error: "Invalid OTP" });
      return;
    }

    db.prepare("DELETE FROM otp_verification WHERE id = ?").run(otpRecord.id);

    const existingUser = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email);

    if (existingUser) {
      db.prepare("UPDATE users SET emailVerified = 1 WHERE email = ?").run(
        email
      );
    }

    res.json({
      message: "OTP verified successfully",
      userExists: !!existingUser,
      user: existingUser,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
};
