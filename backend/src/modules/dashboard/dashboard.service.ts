import prisma from "../../lib/prisma";

export async function getDashboardStats(filters: any = {}) {
  const { warehouseId, locationId, category } = filters;

  // Products count
  const productsWhere: any = { isActive: true };
  if (category) productsWhere.category = category;

  const totalProducts = await prisma.product.count({ where: productsWhere });

  // Stock stats
  const stockWhere: any = {};
  if (locationId) stockWhere.locationId = locationId;
  else if (warehouseId) stockWhere.location = { warehouseId };

  const allStock = await prisma.stockQuant.findMany({
    where: stockWhere,
    include: { product: true },
  });

  const productsInStock = new Set(
    allStock.filter((s) => s.quantity > 0).map((s) => s.productId)
  ).size;
  const lowStockItems = allStock.filter(
    (s) => s.quantity > 0 && s.quantity < 10
  ).length;
  const outOfStockItems = allStock.filter((s) => s.quantity === 0).length;

  // Operations counts
  const receiptsWhere: any = { status: { in: ["DRAFT", "WAITING"] } };
  const deliveriesWhere: any = { status: { in: ["DRAFT", "WAITING"] } };
  const transfersWhere: any = { status: { in: ["DRAFT", "WAITING"] } };

  const pendingReceipts = await prisma.receipt.count({ where: receiptsWhere });
  const pendingDeliveries = await prisma.deliveryOrder.count({
    where: deliveriesWhere,
  });
  const pendingTransfers = await prisma.internalTransfer.count({
    where: transfersWhere,
  });

  return {
    totalProducts,
    productsInStock,
    lowStockItems,
    outOfStockItems,
    pendingReceipts,
    pendingDeliveries,
    pendingTransfers,
  };
}
