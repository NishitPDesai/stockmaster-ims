import { Request, Response } from "express";
import * as service from "./auth.service";
import jwt from "jsonwebtoken";
import config from "../../config";

export async function signup(req: Request, res: Response) {
  const { name, email, password } = req.body;
  const user = await service.createUser(name, email, password);
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    config.jwtSecret,
    { expiresIn: "8h" }
  );
  res.cookie(config.cookieName, token, { httpOnly: true, sameSite: "lax" });
  res.json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    token,
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await service.verifyCredentials(email, password);
  if (!user)
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    config.jwtSecret,
    { expiresIn: "8h" }
  );
  res.cookie(config.cookieName, token, { httpOnly: true, sameSite: "lax" });
  res.json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    token,
  });
}

export async function me(req: Request, res: Response) {
  // req.user should be attached by middleware
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const user = req.user;
  if (!user)
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  res.json({ success: true, user });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie(config.cookieName);
  res.json({ success: true });
}
