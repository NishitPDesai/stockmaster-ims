import { Router } from "express";
import * as controller from "./dashboard.controller";
import { requireAuth } from "../../middleware/auth";

const router = Router();

router.get("/", requireAuth, controller.getStats);

export default router;
