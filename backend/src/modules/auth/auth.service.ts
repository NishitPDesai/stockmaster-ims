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

export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
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
