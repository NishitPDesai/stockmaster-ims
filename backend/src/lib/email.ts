import nodemailer from "nodemailer";
import config from "../config";

// Validate SMTP credentials
function validateSmtpConfig() {
  if (!config.smtpUser || !config.smtpPassword) {
    throw new Error(
      "SMTP credentials are missing. Please set SMTP_USER and SMTP_PASSWORD in your .env file."
    );
  }
}

// Create reusable transporter (only if credentials are available)
function createTransporter() {
  validateSmtpConfig();
  
  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure, // true for 465, false for other ports
    auth: {
      user: config.smtpUser,
      pass: config.smtpPassword,
    },
  });
}

export async function sendPasswordResetOTP(email: string, otp: string, userName: string) {
  // Validate credentials before attempting to send
  validateSmtpConfig();
  
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"StockMaster IMS" <${config.smtpFrom || config.smtpUser}>`,
    to: email,
    subject: "Password Reset OTP - StockMaster IMS",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset OTP</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
          <h2 style="color: #2c3e50; margin-top: 0;">Password Reset Request</h2>
          <p>Hello ${userName},</p>
          <p>You have requested to reset your password for your StockMaster IMS account.</p>
          <p>Please use the following OTP (One-Time Password) to reset your password:</p>
          <div style="background-color: #ffffff; border: 2px dashed #3498db; border-radius: 5px; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #3498db; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p><strong>This OTP will expire in ${config.otpExpiresMin} minutes.</strong></p>
          <p>If you did not request this password reset, please ignore this email and your password will remain unchanged.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #777;">This is an automated message, please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `,
    text: `
      Password Reset Request
      
      Hello ${userName},
      
      You have requested to reset your password for your StockMaster IMS account.
      
      Please use the following OTP (One-Time Password) to reset your password:
      
      ${otp}
      
      This OTP will expire in ${config.otpExpiresMin} minutes.
      
      If you did not request this password reset, please ignore this email and your password will remain unchanged.
      
      This is an automated message, please do not reply to this email.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}

// Verify email configuration
export async function verifyEmailConfig() {
  try {
    validateSmtpConfig();
    const transporter = createTransporter();
    await transporter.verify();
    console.log("Email server is ready to send messages");
    return true;
  } catch (error: any) {
    if (error.message?.includes("SMTP credentials are missing")) {
      console.error("❌ Email configuration error:", error.message);
      console.error("   Please set SMTP_USER and SMTP_PASSWORD in your .env file");
    } else {
      console.error("Email server configuration error:", error);
    }
    return false;
  }
}

