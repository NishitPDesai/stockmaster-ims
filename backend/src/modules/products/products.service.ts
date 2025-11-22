import prisma from "../../lib/prisma";

export async function listProducts(filters: any = {}) {
  const { search, category, warehouseId, locationId, lowStockOnly } = filters;

  const where: any = { isActive: true };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.category = category;
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      stockQuants: {
        include: {
          location: {
            include: {
              warehouse: true,
            },
          },
        },
        where: locationId
          ? { locationId }
          : warehouseId
          ? { location: { warehouseId } }
          : undefined,
      },
    },
    orderBy: { name: "asc" },
  });

  // Aggregate stock per warehouse
  const productsWithStock = products.map((product) => {
    const stockPerWarehouse: Record<string, number> = {};

    product.stockQuants.forEach((quant) => {
      const whId = quant.location.warehouseId;
      stockPerWarehouse[whId] = (stockPerWarehouse[whId] || 0) + quant.quantity;
    });

    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      uom: product.uom,
      initialStock: product.initialStock,
      stockPerWarehouse,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  });

  if (lowStockOnly) {
    // Filter products with total stock < 10 (simple heuristic)
    return productsWithStock.filter((p) => {
      const total = Object.values(p.stockPerWarehouse).reduce(
        (a, b) => a + b,
        0
      );
      return total < 10;
    });
  }

  return productsWithStock;
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      stockQuants: {
        include: {
          location: {
            include: {
              warehouse: true,
            },
          },
        },
      },
    },
  });

  if (!product) return null;

  const stockPerWarehouse: Record<string, number> = {};
  product.stockQuants.forEach((quant) => {
    const whId = quant.location.warehouseId;
    stockPerWarehouse[whId] = (stockPerWarehouse[whId] || 0) + quant.quantity;
  });

  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    category: product.category,
    uom: product.uom,
    initialStock: product.initialStock,
    stockPerWarehouse,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export async function createProduct(data: {
  name: string;
  sku: string;
  category?: string;
  uom?: string;
  initialStock?: number;
}) {
  const product = await prisma.product.create({
    data: {
      name: data.name,
      sku: data.sku,
      category: data.category,
      uom: data.uom,
      initialStock: data.initialStock || 0,
    },
  });

  return product;
}

export async function updateProduct(
  id: string,
  data: Partial<{
    name: string;
    sku: string;
    category: string;
    uom: string;
    isActive: boolean;
  }>
) {
  const product = await prisma.product.update({
    where: { id },
    data,
  });

  return product;
}

export async function deleteProduct(id: string) {
  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function getProductStock(productId: string) {
  const quants = await prisma.stockQuant.findMany({
    where: { productId },
    include: {
      location: {
        include: {
          warehouse: true,
        },
      },
    },
  });

  return quants.map((q) => ({
    locationId: q.locationId,
    locationName: q.location.name,
    warehouseId: q.location.warehouseId,
    warehouseName: q.location.warehouse.name,
    quantity: q.quantity,
  }));
}
