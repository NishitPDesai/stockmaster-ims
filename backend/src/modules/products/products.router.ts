import { Router } from "express";
import * as controller from "./products.controller";
import { requireAuth, requireRole } from "../../middleware/auth";

const router = Router();

router.get("/", requireAuth, controller.list);
router.get("/:id", requireAuth, controller.getOne);
router.post("/", requireAuth, requireRole(["MANAGER"]), controller.create);
router.patch("/:id", requireAuth, controller.update);
router.delete("/:id", requireAuth, requireRole(["MANAGER"]), controller.remove);
router.get("/:id/stock", requireAuth, controller.getStock);

export default router;
