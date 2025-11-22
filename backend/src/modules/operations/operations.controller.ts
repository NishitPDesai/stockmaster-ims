import { Request, Response } from "express";
import * as service from "./operations.service";

// Receipts
export async function listReceipts(req: Request, res: Response) {
  const filters = {
    status: req.query.status,
    warehouseId: req.query.warehouseId,
    supplierName: req.query.supplierName,
    dateFrom: req.query.dateFrom,
    dateTo: req.query.dateTo,
  };
  const receipts = await service.listReceipts(filters);
  res.json(receipts);
}

export async function getReceipt(req: Request, res: Response) {
  const receipt = await service.getReceiptById(req.params.id);
  if (!receipt)
    return res
      .status(404)
      .json({ success: false, message: "Receipt not found" });
  res.json(receipt);
}

export async function createReceipt(req: Request, res: Response) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const userId = req.user?.id;
  const receipt = await service.createReceipt(req.body, userId);
  res.status(201).json(receipt);
}

export async function updateReceipt(req: Request, res: Response) {
  const receipt = await service.updateReceipt(req.params.id, req.body);
  res.json(receipt);
}

export async function validateReceipt(req: Request, res: Response) {
  const receipt = await service.validateReceipt(req.params.id);
  res.json(receipt);
}

// Deliveries
export async function listDeliveries(req: Request, res: Response) {
  const filters = {
    status: req.query.status,
    warehouseId: req.query.warehouseId,
    customerName: req.query.customerName,
    dateFrom: req.query.dateFrom,
    dateTo: req.query.dateTo,
  };
  const deliveries = await service.listDeliveries(filters);
  res.json(deliveries);
}

export async function getDelivery(req: Request, res: Response) {
  const delivery = await service.getDeliveryById(req.params.id);
  if (!delivery)
    return res
      .status(404)
      .json({ success: false, message: "Delivery not found" });
  res.json(delivery);
}

export async function createDelivery(req: Request, res: Response) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const userId = req.user?.id;
  const delivery = await service.createDelivery(req.body, userId);
  res.status(201).json(delivery);
}

export async function updateDelivery(req: Request, res: Response) {
  const delivery = await service.updateDelivery(req.params.id, req.body);
  res.json(delivery);
}

export async function validateDelivery(req: Request, res: Response) {
  const delivery = await service.validateDelivery(req.params.id);
  res.json(delivery);
}

// Transfers
export async function listTransfers(req: Request, res: Response) {
  const filters = {
    status: req.query.status,
    dateFrom: req.query.dateFrom,
    dateTo: req.query.dateTo,
  };
  const transfers = await service.listTransfers(filters);
  res.json(transfers);
}

export async function getTransfer(req: Request, res: Response) {
  const transfer = await service.getTransferById(req.params.id);
  if (!transfer)
    return res
      .status(404)
      .json({ success: false, message: "Transfer not found" });
  res.json(transfer);
}

export async function createTransfer(req: Request, res: Response) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const userId = req.user?.id;
  const transfer = await service.createTransfer(req.body, userId);
  res.status(201).json(transfer);
}

export async function updateTransfer(req: Request, res: Response) {
  const transfer = await service.updateTransfer(req.params.id, req.body);
  res.json(transfer);
}

export async function validateTransfer(req: Request, res: Response) {
  const transfer = await service.validateTransfer(req.params.id);
  res.json(transfer);
}

// Adjustments
export async function listAdjustments(req: Request, res: Response) {
  const filters = {
    status: req.query.status,
    locationId: req.query.locationId,
    dateFrom: req.query.dateFrom,
    dateTo: req.query.dateTo,
  };
  const adjustments = await service.listAdjustments(filters);
  res.json(adjustments);
}

export async function getAdjustment(req: Request, res: Response) {
  const adjustment = await service.getAdjustmentById(req.params.id);
  if (!adjustment)
    return res
      .status(404)
      .json({ success: false, message: "Adjustment not found" });
  res.json(adjustment);
}

export async function createAdjustment(req: Request, res: Response) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const userId = req.user?.id;
  const adjustment = await service.createAdjustment(req.body, userId);
  res.status(201).json(adjustment);
}

export async function updateAdjustment(req: Request, res: Response) {
  const adjustment = await service.updateAdjustment(req.params.id, req.body);
  res.json(adjustment);
}

export async function validateAdjustment(req: Request, res: Response) {
  const adjustment = await service.validateAdjustment(req.params.id);
  res.json(adjustment);
}
