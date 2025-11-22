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
  const refreshToken = jwt.sign(
    { userId: user.id, role: user.role },
    config.jwtSecret,
    { expiresIn: "7d" }
  );
  res.cookie(config.cookieName, token, { httpOnly: true, sameSite: "lax" });
  res.json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    token,
    refreshToken,
  });
}

export async function register(req: Request, res: Response) {
  try {
    const { loginId, email, password } = req.body;
    
    if (!loginId || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "loginId, email, and password are required" });
    }

    // Check if email already exists
    const existingUserByEmail = await service.findUserByEmail(email);
    if (existingUserByEmail) {
      return res
        .status(409)
        .json({ success: false, message: "User with this email already exists" });
    }

    // Check if loginId (name) already exists
    const existingUserByName = await service.findUserByName(loginId);
    if (existingUserByName) {
      return res
        .status(409)
        .json({ success: false, message: "User with this login ID already exists" });
    }

    // Create user with loginId as name
    const user = await service.createUser(loginId, email, password, "STAFF");
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: "8h" }
    );
    const refreshToken = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: "7d" }
    );
    res.cookie(config.cookieName, token, { httpOnly: true, sameSite: "lax" });
    res.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
      refreshToken,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
}

export async function login(req: Request, res: Response) {
  const { loginId, email, password } = req.body;
  // Support both loginId and email for backward compatibility
  const identifier = loginId || email;
  if (!identifier || !password) {
    return res
      .status(400)
      .json({ success: false, message: "loginId/email and password are required" });
  }
  
  const user = await service.verifyCredentials(identifier, password);
  if (!user)
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    config.jwtSecret,
    { expiresIn: "8h" }
  );
  const refreshToken = jwt.sign(
    { userId: user.id, role: user.role },
    config.jwtSecret,
    { expiresIn: "7d" }
  );
  res.cookie(config.cookieName, token, { httpOnly: true, sameSite: "lax" });
  res.json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    token,
    refreshToken,
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

export async function requestPasswordReset(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const result = await service.requestPasswordReset(email);
    res.json(result);
  } catch (error: any) {
    console.error("Password reset request error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process password reset request",
    });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Email, OTP, and new password are required",
        });
    }

    // Validate password strength (optional but recommended)
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 8 characters long",
        });
    }

    const result = await service.resetPasswordWithOTP(email, otp, newPassword);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error("Password reset error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to reset password",
    });
  }
}