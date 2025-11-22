import { Router } from "express";
import * as controller from "./ledger.controller";
import { requireAuth } from "../../middleware/auth";

const router = Router();

router.get("/", requireAuth, controller.list);

export default router;
