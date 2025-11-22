import { Request, Response } from "express";
import * as service from "./locations.service";

export async function list(req: Request, res: Response) {
  const locations = await service.listLocations(
    req.query.warehouseId as string
  );
  res.json(locations);
}

export async function getOne(req: Request, res: Response) {
  const location = await service.getLocationById(req.params.id);
  if (!location)
    return res
      .status(404)
      .json({ success: false, message: "Location not found" });
  res.json(location);
}

export async function create(req: Request, res: Response) {
  const location = await service.createLocation(req.body);
  res.status(201).json(location);
}

export async function update(req: Request, res: Response) {
  const location = await service.updateLocation(req.params.id, req.body);
  res.json(location);
}

export async function remove(req: Request, res: Response) {
  await service.deleteLocation(req.params.id);
  res.json({ success: true });
}
