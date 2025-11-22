import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import prisma from "../lib/prisma";

export async function attachUser(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const token =
    req.cookies?.[config.cookieName] ||
    req.get("Authorization")?.replace(/^Bearer\s/, "") ||
    null;
  if (!token) return next();
  try {
    const payload: any = jwt.verify(token, config.jwtSecret);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true },
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    req.user = user;
  } catch (err) {
    // ignore invalid token
  }
  return next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (!req.user)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  next();
}

export function requireRole(roles: Array<"MANAGER" | "STAFF">) {
  return (req: Request, res: Response, next: NextFunction) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const user = req.user;
    if (!user)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!roles.includes(user.role))
      return res.status(403).json({ success: false, message: "Forbidden" });
    next();
  };
}
