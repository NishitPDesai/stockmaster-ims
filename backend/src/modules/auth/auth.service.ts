import prisma from "../../lib/prisma";
import bcrypt from "bcrypt";
import { addMinutes } from "date-fns";
import config from "../../config";
import { sendPasswordResetOTP } from "../../lib/email";

export async function createUser(
  name: string,
  email: string,
  password: string,
  role: "MANAGER" | "STAFF" = "STAFF"
) {
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash: hash, role },
  });
  return user;
}

export async function verifyCredentials(emailOrLoginId: string, password: string) {
  // Try to find user by email first
  let user = await prisma.user.findUnique({ where: { email: emailOrLoginId } });
  
  // If not found by email, try to find by name (loginId)
  if (!user) {
    user = await prisma.user.findFirst({ where: { name: emailOrLoginId } });
  }
  
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return user;
}

export async function createOtpForUser(userId: string, code: string) {
  const expiresAt = addMinutes(new Date(), config.otpExpiresMin);
  return prisma.oTP.create({ data: { userId, code, expiresAt } });
}

export async function consumeOtp(userId: string, code: string) {
  const otp = await prisma.oTP.findFirst({
    where: { userId, code, consumed: false, expiresAt: { gt: new Date() } },
  });
  if (!otp) return null;
  await prisma.oTP.update({ where: { id: otp.id }, data: { consumed: true } });
  return otp;
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserByName(name: string) {
  return prisma.user.findFirst({ where: { name } });
}

/**
 * Generate a random 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Request password reset - generates OTP and sends email
 */
export async function requestPasswordReset(email: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    // Don't reveal if user exists or not for security
    return { success: true, message: "If the email exists, an OTP has been sent." };
  }

  // Generate OTP
  const otpCode = generateOTP();

  // Invalidate any existing unused OTPs for this user
  await prisma.oTP.updateMany({
    where: {
      userId: user.id,
      consumed: false,
    },
    data: {
      consumed: true,
    },
  });

  // Create new OTP
  await createOtpForUser(user.id, otpCode);

  // Send email
  try {
    await sendPasswordResetOTP(user.email, otpCode, user.name);
    return { success: true, message: "If the email exists, an OTP has been sent." };
  } catch (error: any) {
    const errorMessage = error?.message || "Unknown error";
    console.error("Failed to send password reset email:", errorMessage);
    
    // Check if it's a configuration error
    if (errorMessage.includes("SMTP credentials are missing")) {
      console.error("   Please configure SMTP_USER and SMTP_PASSWORD in your .env file");
    }
    
    // Still return success to not reveal if email exists
    return { success: true, message: "If the email exists, an OTP has been sent." };
  }
}

/**
 * Verify OTP and reset password
 */
export async function resetPasswordWithOTP(email: string, otp: string, newPassword: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    return { success: false, message: "Invalid email or OTP" };
  }

  // Verify and consume OTP
  const otpRecord = await consumeOtp(user.id, otp);
  if (!otpRecord) {
    return { success: false, message: "Invalid or expired OTP" };
  }

  // Update password
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return { success: true, message: "Password has been reset successfully" };
}
