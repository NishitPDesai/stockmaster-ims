import prisma from "../../lib/prisma";
import bcrypt from "bcrypt";
import { addMinutes } from "date-fns";
import config from "../../config";

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
