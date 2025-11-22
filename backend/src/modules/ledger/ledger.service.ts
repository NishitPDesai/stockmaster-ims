import prisma from "../../lib/prisma";

export async function getMoves(filters: any = {}) {
  const {
    productId,
    warehouseId,
    locationId,
    moveType,
    dateFrom,
    dateTo,
    status,
  } = filters;

  const where: any = {};

  if (productId) where.productId = productId;
  if (moveType) where.moveType = moveType;
  if (status) where.status = status;

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const moves = await prisma.stockMove.findMany({
    where,
    include: {
      product: true,
      fromLocation: { include: { warehouse: true } },
      toLocation: { include: { warehouse: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 1000,
  });

  // Filter by warehouse or location if specified
  let filtered = moves;
  if (warehouseId) {
    filtered = moves.filter(
      (m) =>
        m.fromLocation?.warehouseId === warehouseId ||
        m.toLocation?.warehouseId === warehouseId
    );
  }
  if (locationId) {
    filtered = moves.filter(
      (m) => m.fromLocationId === locationId || m.toLocationId === locationId
    );
  }

  return filtered.map((m) => ({
    id: m.id,
    moveType: m.moveType,
    reference: m.reference,
    productId: m.productId,
    productName: m.product.name,
    productSku: m.product.sku,
    fromLocationId: m.fromLocationId,
    fromLocationName: m.fromLocation?.name,
    fromWarehouseId: m.fromLocation?.warehouseId,
    fromWarehouseName: m.fromLocation?.warehouse.name,
    toLocationId: m.toLocationId,
    toLocationName: m.toLocation?.name,
    toWarehouseId: m.toLocation?.warehouseId,
    toWarehouseName: m.toLocation?.warehouse.name,
    quantity: m.quantity,
    status: m.status,
    createdAt: m.createdAt.toISOString(),
  }));
}
