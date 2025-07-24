app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Check if user already exists
    const existingUser = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email);
    if (existingUser && existingUser.emailVerified === 1) {
      // User is already verified, do not generate OTP
      return res.json({
        message: "User already verified",
        userExists: true,
        user: existingUser,
        otpNeeded: false,
      });
    }
    // Generate OTP for all users (new and existing)
    const otp = generateOTP();
    const otpId = Date.now().toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes
    // Store OTP in database
    db.prepare(
      "INSERT INTO otp_verification (id, email, otp, expiresAt, createdAt) VALUES (?, ?, ?, ?, ?)"
    ).run(otpId, email, otp, expiresAt, new Date().toISOString());
    // Do NOT send OTP email from backend anymore
    // Instead, return the OTP to the frontend for EmailJS
    res.json({
      message: "OTP generated successfully",
      otpId,
      otp, // <-- Return OTP for frontend to use
      userExists: !!existingUser,
      user: existingUser || null,
      otpNeeded: true,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ error: "Failed to generate OTP" });
  }
});

app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  try {
    // Find the most recent OTP for this email
    const otpRecord = db
      .prepare(
        "SELECT * FROM otp_verification WHERE email = ? ORDER BY createdAt DESC LIMIT 1"
      )
      .get(email);

    if (!otpRecord) {
      return res.status(400).json({ error: "No OTP found for this email" });
    }

    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expiresAt)) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Delete the used OTP
    db.prepare("DELETE FROM otp_verification WHERE id = ?").run(otpRecord.id);

    // Check if user exists and return user data
    const existingUser = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email);
    // Mark user as verified if exists
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
});
