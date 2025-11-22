import { Request, Response } from "express";
import * as service from "./dashboard.service";

export async function getStats(req: Request, res: Response) {
  const filters = {
    warehouseId: req.query.warehouseId,
    locationId: req.query.locationId,
    category: req.query.category,
  };

  const stats = await service.getDashboardStats(filters);
  res.json(stats);
}
