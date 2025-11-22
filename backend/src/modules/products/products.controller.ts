import { Request, Response } from "express";
import * as service from "./products.service";

export async function list(req: Request, res: Response) {
  const filters = {
    search: req.query.search as string,
    category: req.query.category as string,
    warehouseId: req.query.warehouseId as string,
    locationId: req.query.locationId as string,
    lowStockOnly: req.query.lowStockOnly === "true",
  };

  const products = await service.listProducts(filters);
  res.json(products);
}

export async function getOne(req: Request, res: Response) {
  const product = await service.getProductById(req.params.id);
  if (!product)
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  res.json(product);
}

export async function create(req: Request, res: Response) {
  const product = await service.createProduct(req.body);
  res.status(201).json(product);
}

export async function update(req: Request, res: Response) {
  const product = await service.updateProduct(req.params.id, req.body);
  res.json(product);
}

export async function remove(req: Request, res: Response) {
  await service.deleteProduct(req.params.id);
  res.json({ success: true });
}

export async function getStock(req: Request, res: Response) {
  const stock = await service.getProductStock(req.params.id);
  res.json(stock);
}
