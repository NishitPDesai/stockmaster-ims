import { Router } from "express";
import * as controller from "./auth.controller";
import { attachUser } from "../../middleware/auth";

const router = Router();

router.post("/signup", controller.signup);
router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/logout", controller.logout);
router.get("/me", attachUser, controller.me);
router.post("/password-reset/request", controller.requestPasswordReset);
router.post("/password-reset/reset", controller.resetPassword);

export default router;
