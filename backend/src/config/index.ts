import dotenv from "dotenv";

dotenv.config();

const config = {
  port: Number(process.env.PORT || 5000),
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "please-change-me",
  cookieName: process.env.COOKIE_NAME || "sm_auth",
  otpExpiresMin: Number(process.env.OTP_EXPIRES_MIN || 15),
};

export default config;
