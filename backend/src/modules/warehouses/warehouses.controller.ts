import { Request, Response } from "express";
import * as service from "./warehouses.service";

export async function list(_req: Request, res: Response) {
  const warehouses = await service.listWarehouses();
  res.json(warehouses);
}

export async function getOne(req: Request, res: Response) {
  const warehouse = await service.getWarehouseById(req.params.id);
  if (!warehouse)
    return res
      .status(404)
      .json({ success: false, message: "Warehouse not found" });
  res.json(warehouse);
}

export async function create(req: Request, res: Response) {
  const warehouse = await service.createWarehouse(req.body);
  res.status(201).json(warehouse);
}

export async function update(req: Request, res: Response) {
  const warehouse = await service.updateWarehouse(req.params.id, req.body);
  res.json(warehouse);
}

export async function remove(req: Request, res: Response) {
  await service.deleteWarehouse(req.params.id);
  res.json({ success: true });
}
