import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import * as service from "./products.service";

export async function list(req: Request, res: Response) {
  try {
    const filters = {
      search: req.query.search as string,
      category: req.query.category as string,
      warehouseId: req.query.warehouseId as string,
      locationId: req.query.locationId as string,
      lowStockOnly: req.query.lowStockOnly === "true",
    };

    const products = await service.listProducts(filters);
    res.json(products);
  } catch (error: any) {
    console.error("List products error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to list products",
    });
  }
}

export async function getOne(req: Request, res: Response) {
  try {
    const product = await service.getProductById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json(product);
  } catch (error: any) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get product",
    });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const product = await service.createProduct(req.body);
    res.status(201).json(product);
  } catch (error: any) {
    console.error("Create product error:", error);
    
    // Handle Prisma unique constraint violation
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const field = error.meta?.target as string[];
        if (field?.includes("sku")) {
          return res.status(409).json({
            success: false,
            message: "A product with this SKU already exists",
          });
        }
        return res.status(409).json({
          success: false,
          message: "A product with this information already exists",
        });
      }
    }
    
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create product",
    });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const product = await service.updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (error: any) {
    console.error("Update product error:", error);
    
    // Handle Prisma unique constraint violation
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const field = error.meta?.target as string[];
        if (field?.includes("sku")) {
          return res.status(409).json({
            success: false,
            message: "A product with this SKU already exists",
          });
        }
        return res.status(409).json({
          success: false,
          message: "A product with this information already exists",
        });
      }
      if (error.code === "P2025") {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
    }
    
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    await service.deleteProduct(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete product",
    });
  }
}

export async function getStock(req: Request, res: Response) {
  try {
    const stock = await service.getProductStock(req.params.id);
    res.json(stock);
  } catch (error: any) {
    console.error("Get product stock error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get product stock",
    });
  }
}
