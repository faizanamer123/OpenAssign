import emailjs from 'emailjs-com';

export async function sendOtpEmail({ toEmail, userName, otpCode, subject, message }) {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const userId = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !userId) {
    console.error('[sendOtpEmail] Missing EmailJS environment variables.');
    throw new Error('Missing EmailJS environment variables.');
  }

  try {
    const result = await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: toEmail,
        user_name: userName,
        otp_code: otpCode,
        subject: subject,
        message: message,
      },
      userId
    );
    console.log('[sendOtpEmail] Email sent successfully:', result.status, result.text);
    return result;
  } catch (error) {
    console.error('[sendOtpEmail] Failed to send email:', error);
    throw error;
  }
}
