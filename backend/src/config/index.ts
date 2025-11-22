import dotenv from "dotenv";

dotenv.config();

// Helper function to auto-detect SMTP host from email domain
function getSmtpHost(email: string): string {
  if (email.includes("@gmail.com")) return "smtp.gmail.com";
  if (email.includes("@outlook.com") || email.includes("@hotmail.com")) return "smtp-mail.outlook.com";
  if (email.includes("@yahoo.com")) return "smtp.mail.yahoo.com";
  return "smtp.gmail.com"; // Default to Gmail
}

const config = {
  port: Number(process.env.PORT || 5000),
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "please-change-me",
  cookieName: process.env.COOKIE_NAME || "sm_auth",
  otpExpiresMin: Number(process.env.OTP_EXPIRES_MIN || 15),
  // Email configuration - only SMTP_USER and SMTP_PASSWORD required
  smtpUser: process.env.SMTP_USER || "",
  smtpPassword: process.env.SMTP_PASSWORD || "",
  // Auto-detect SMTP settings from email domain or use Gmail defaults
  smtpHost: process.env.SMTP_HOST || getSmtpHost(process.env.SMTP_USER || ""),
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure: process.env.SMTP_SECURE === "true", // false for port 587 (TLS), true for 465 (SSL)
  smtpFrom: process.env.SMTP_USER || "", // Use SMTP_USER as from address
};

export default config;
