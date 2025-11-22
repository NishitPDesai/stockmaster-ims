import { Request, Response } from "express";
import * as service from "./ledger.service";

export async function list(req: Request, res: Response) {
  const filters = {
    productId: req.query.productId,
    warehouseId: req.query.warehouseId,
    locationId: req.query.locationId,
    moveType: req.query.moveType,
    status: req.query.status,
    dateFrom: req.query.dateFrom,
    dateTo: req.query.dateTo,
  };

  const moves = await service.getMoves(filters);
  res.json(moves);
}
