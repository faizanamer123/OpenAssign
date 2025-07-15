# OpenAssign Backend Server

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Email Configuration for OTP
To enable OTP verification, you need to set up email sending:

1. **Create a Gmail account** or use your existing Gmail
2. **Enable 2-Factor Authentication** on your Gmail account
3. **Generate an App Password**:
   - Go to Google Account Settings → Security
   - Enable 2-Step Verification if not already enabled
   - Go to App Passwords
   - Generate a new app password for "Mail"
4. **Create a `.env` file** in the server directory:
   ```
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_app_password_here
   ```
   Example: 
   ```
   EMAIL_USER=faizan.amer.390@gmail.com
   EMAIL_PASS=abcd efgh ijkl mnop
   ```

### 3. Start the Server
```bash
npm start
```

## Features

- **OTP Verification**: Sends 6-digit verification codes to user emails
- **Email Notifications**: Sends email notifications when assignments are solved
- **File Uploads**: Supports file uploads for assignments and submissions
- **Real-time Leaderboard**: Dynamic points calculation based on submission ratings

## API Endpoints

- `POST /send-otp` - Send OTP to user's email
- `POST /verify-otp` - Verify OTP code
- `POST /users` - Create new user (after OTP verification)
- `GET /users` - Get all users
- `POST /assignments` - Upload new assignment
- `GET /assignments` - Get all assignments
- `POST /submissions` - Submit solution
- `GET /submissions` - Get submissions
- `PATCH /submissions/:id/rate` - Rate a submission
- `GET /leaderboard` - Get leaderboard
- `GET /analytics` - Get analytics data

## OTP Verification Flow

1. User enters email → System sends 6-digit OTP
2. User enters OTP → System verifies the code
3. If valid → User can proceed to sign up/sign in
4. If invalid → User can request new OTP after 60 seconds

## Security Features

- OTP expires after 10 minutes
- Rate limiting on OTP requests
- Secure email delivery via Gmail SMTP
- Automatic cleanup of expired OTPs

## Email Setup

The server uses Gmail SMTP to send:
- OTP verification codes
- Assignment solved notifications
- Other system notifications

Make sure your Gmail account has:
- 2-Factor Authentication enabled
- App Password generated for mail access
- Less secure app access disabled (use App Password instead) 

## EmailJS OTP Verification Setup

This backend uses [EmailJS](https://www.emailjs.com/) to send OTP codes for user verification.

### Required .env variables:

EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=openassign_otp_verification
EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_PRIVATE_KEY=your_private_api_key

- The backend uses EMAILJS_PRIVATE_KEY for secure API calls to EmailJS.
- The public key is for frontend use only (if ever needed, not used in this backend).
- Create a template in EmailJS named `openassign_otp_verification` with variables: `user_name`, `otp_code`, `to_email`.
- Set these variables in your .env file with your EmailJS credentials. 