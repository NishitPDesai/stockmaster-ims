import { Router } from "express";
import * as controller from "./operations.controller";
import { requireAuth, requireRole } from "../../middleware/auth";

const router = Router();

// Receipts
router.get("/receipts", requireAuth, controller.listReceipts);
router.get("/receipts/:id", requireAuth, controller.getReceipt);
router.post("/receipts", requireAuth, controller.createReceipt);
router.patch("/receipts/:id", requireAuth, controller.updateReceipt);
router.post("/receipts/:id/validate", requireAuth, controller.validateReceipt);

// Deliveries
router.get("/deliveries", requireAuth, controller.listDeliveries);
router.get("/deliveries/:id", requireAuth, controller.getDelivery);
router.post("/deliveries", requireAuth, controller.createDelivery);
router.patch("/deliveries/:id", requireAuth, controller.updateDelivery);
router.post(
  "/deliveries/:id/validate",
  requireAuth,
  controller.validateDelivery
);

// Transfers
router.get("/transfers", requireAuth, controller.listTransfers);
router.get("/transfers/:id", requireAuth, controller.getTransfer);
router.post("/transfers", requireAuth, controller.createTransfer);
router.patch("/transfers/:id", requireAuth, controller.updateTransfer);
router.post(
  "/transfers/:id/validate",
  requireAuth,
  controller.validateTransfer
);

// Adjustments
router.get("/adjustments", requireAuth, controller.listAdjustments);
router.get("/adjustments/:id", requireAuth, controller.getAdjustment);
router.post(
  "/adjustments",
  requireAuth,
  requireRole(["MANAGER"]),
  controller.createAdjustment
);
router.patch(
  "/adjustments/:id",
  requireAuth,
  requireRole(["MANAGER"]),
  controller.updateAdjustment
);
router.post(
  "/adjustments/:id/validate",
  requireAuth,
  requireRole(["MANAGER"]),
  controller.validateAdjustment
);

export default router;
