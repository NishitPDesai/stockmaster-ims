import { Router } from "express";
import * as controller from "./warehouses.controller";
import { requireAuth, requireRole } from "../../middleware/auth";

const router = Router();

router.get("/", requireAuth, controller.list);
router.get("/:id", requireAuth, controller.getOne);
router.post("/", requireAuth, requireRole(["MANAGER"]), controller.create);
router.patch("/:id", requireAuth, requireRole(["MANAGER"]), controller.update);
router.delete("/:id", requireAuth, requireRole(["MANAGER"]), controller.remove);

export default router;
