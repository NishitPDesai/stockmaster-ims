import prisma from "../../lib/prisma";
import { OperationStatus } from "@prisma/client";

// Transform operation data to match frontend expectations
function transformOperation(operation: any, type: string) {
  const baseTransform = {
    ...operation,
    documentType: type,
    documentNumber: operation.code,
    lineItems:
      operation.lines?.map((line: any) => ({
        id: line.id,
        productId: line.productId,
        productName: line.product?.name,
        productSku: line.product?.sku,
        quantity: line.orderedQty || line.receivedQty || line.quantity || 0,
        uom: line.product?.uom,
        unitPrice: line.unitPrice,
        totalPrice: line.totalPrice,
      })) || [],
  };

  // Add type-specific fields
  if (type === "RECEIPT") {
    return {
      ...baseTransform,
      warehouseId: operation.lines?.[0]?.location?.warehouseId,
      warehouseName: operation.lines?.[0]?.location?.warehouse?.name,
    };
  } else if (type === "DELIVERY") {
    return {
      ...baseTransform,
      warehouseId: operation.lines?.[0]?.sourceLocation?.warehouseId,
      warehouseName: operation.lines?.[0]?.sourceLocation?.warehouse?.name,
    };
  } else if (type === "TRANSFER") {
    return {
      ...baseTransform,
      sourceWarehouseId: operation.lines?.[0]?.sourceLocation?.warehouseId,
      sourceWarehouseName:
        operation.lines?.[0]?.sourceLocation?.warehouse?.name,
      destinationWarehouseId:
        operation.lines?.[0]?.destinationLocation?.warehouseId,
      destinationWarehouseName:
        operation.lines?.[0]?.destinationLocation?.warehouse?.name,
    };
  } else if (type === "ADJUSTMENT") {
    return {
      ...baseTransform,
      warehouseId: operation.location?.warehouseId,
      warehouseName: operation.location?.warehouse?.name,
    };
  }

  return baseTransform;
}

// List all operations (combined view)
export async function listAllOperations(filters: any = {}) {
  const { status, type, dateFrom, dateTo } = filters;

  const dateFilter: any = {};
  if (dateFrom || dateTo) {
    if (dateFrom) dateFilter.gte = new Date(dateFrom);
    if (dateTo) dateFilter.lte = new Date(dateTo);
  }

  const whereClause: any = {};
  if (status) whereClause.status = status;
  if (Object.keys(dateFilter).length > 0) {
    whereClause.createdAt = dateFilter;
  }

  const operations: any[] = [];

  // Fetch receipts
  if (!type || type === "RECEIPT") {
    const receipts = await prisma.receipt.findMany({
      where: whereClause,
      include: {
        lines: {
          include: {
            product: true,
            location: { include: { warehouse: true } },
          },
        },
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    operations.push(...receipts.map((r) => transformOperation(r, "RECEIPT")));
  }

  // Fetch deliveries
  if (!type || type === "DELIVERY") {
    const deliveries = await prisma.deliveryOrder.findMany({
      where: whereClause,
      include: {
        lines: {
          include: {
            product: true,
            sourceLocation: { include: { warehouse: true } },
          },
        },
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    operations.push(
      ...deliveries.map((d) => transformOperation(d, "DELIVERY"))
    );
  }

  // Fetch transfers
  if (!type || type === "TRANSFER") {
    const transfers = await prisma.internalTransfer.findMany({
      where: whereClause,
      include: {
        lines: {
          include: {
            product: true,
            sourceLocation: { include: { warehouse: true } },
            destinationLocation: { include: { warehouse: true } },
          },
        },
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    operations.push(...transfers.map((t) => transformOperation(t, "TRANSFER")));
  }

  // Fetch adjustments
  if (!type || type === "ADJUSTMENT") {
    const adjustments = await prisma.inventoryAdjustment.findMany({
      where: whereClause,
      include: {
        lines: {
          include: {
            product: true,
          },
        },
        location: { include: { warehouse: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    operations.push(
      ...adjustments.map((a) => transformOperation(a, "ADJUSTMENT"))
    );
  }

  // Sort by createdAt descending
  operations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return operations;
}

async function updateStockQuant(
  productId: string,
  locationId: string,
  delta: number
) {
  const existing = await prisma.stockQuant.findUnique({
    where: { productId_locationId: { productId, locationId } },
  });

  if (existing) {
    return prisma.stockQuant.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + delta },
    });
  } else {
    return prisma.stockQuant.create({
      data: { productId, locationId, quantity: Math.max(0, delta) },
    });
  }
}

export async function listReceipts(filters: any = {}) {
  const { status, warehouseId, supplierName, dateFrom, dateTo } = filters;

  const where: any = {};
  if (status) where.status = status;
  if (supplierName)
    where.supplierName = { contains: supplierName, mode: "insensitive" };
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const receipts = await prisma.receipt.findMany({
    where,
    include: {
      lines: {
        include: {
          product: true,
          location: { include: { warehouse: true } },
        },
      },
      createdBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (warehouseId) {
    return receipts.filter((r) =>
      r.lines.some((l) => l.location?.warehouseId === warehouseId)
    );
  }

  return receipts.map((r) => transformOperation(r, "RECEIPT"));
}

export async function getReceiptById(id: string) {
  const receipt = await prisma.receipt.findUnique({
    where: { id },
    include: {
      lines: {
        include: {
          product: true,
          location: { include: { warehouse: true } },
        },
      },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });
  return receipt ? transformOperation(receipt, "RECEIPT") : null;
}

export async function createReceipt(
  data: {
    code: string;
    supplierName?: string;
    supplierId?: string;
    warehouseId?: string;
    scheduleDate?: string;
    lineItems: Array<{
      productId: string;
      locationId?: string;
      quantity?: number;
      orderedQty?: number;
      receivedQty?: number;
      uom?: string;
    }>;
  },
  userId?: string
) {
  
  // Get default location from warehouse if locationId is not provided in line items
  let defaultLocationId: string | undefined;
  if (data.warehouseId) {
    const defaultLocation = await prisma.location.findFirst({
      where: {
        warehouseId: data.warehouseId,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
    if (defaultLocation) {
      defaultLocationId = defaultLocation.id;
    } else {
      throw new Error(
        `No active location found for warehouse ${data.warehouseId}. Please create a location for this warehouse first.`
      );
    }
  }

  // Map line items to Prisma format
  const mappedLineItems = data.lineItems.map((item) => {
    const locationId = item.locationId || defaultLocationId;
    
    if (!locationId) {
      throw new Error(
        'Location ID is required. Either provide locationId in line items or warehouseId with at least one active location.'
      );
    }

    const orderedQty = item.orderedQty ?? item.quantity;

    const lineItem: any = {
      productId: item.productId,
      locationId,
    };

    // Only include orderedQty if it has a value
    if (orderedQty !== undefined && orderedQty !== null) {
      lineItem.orderedQty = orderedQty;
    }

    // Only include receivedQty if it has a value
    if (item.receivedQty !== undefined && item.receivedQty !== null) {
      lineItem.receivedQty = item.receivedQty;
    }

    return lineItem;
  });

  const receiptData: any = {
    code: data.code,
    createdById: userId,
    lines: {
      create: mappedLineItems,
    },
  };

  // Only include optional fields if they have values
  if (data.supplierName || data.supplierId) {
    receiptData.supplierName = data.supplierName || data.supplierId;
  }
  
  if (data.scheduleDate) {
    receiptData.scheduledDate = new Date(data.scheduleDate);
  }

  return prisma.receipt.create({
    data: receiptData,
    include: { 
      lines: {
        include: {
          product: true,
          location: true,
        },
      },
    },
  });
}

export async function updateReceipt(
  id: string,
  data: Partial<{
    supplierName: string;
    scheduledDate: string;
    status: OperationStatus;
  }>
) {
  return prisma.receipt.update({
    where: { id },
    data: {
      ...data,
      scheduledDate: data.scheduledDate
        ? new Date(data.scheduledDate)
        : undefined,
    },
  });
}

export async function validateReceipt(id: string) {
  return prisma.$transaction(async (tx) => {
    const receipt = await tx.receipt.findUnique({
      where: { id },
      include: { lines: true },
    });

    if (!receipt) throw new Error("Receipt not found");
    if (receipt.status === "DONE") throw new Error("Receipt already validated");

    for (const line of receipt.lines) {
      const qty = line.receivedQty || line.orderedQty || 0;
      if (qty > 0) {
        await updateStockQuant(line.productId, line.locationId, qty);
        await tx.stockMove.create({
          data: {
            moveType: "RECEIPT",
            reference: receipt.code,
            productId: line.productId,
            toLocationId: line.locationId,
            quantity: qty,
            status: "DONE",
          },
        });
      }
    }

    return tx.receipt.update({
      where: { id },
      data: { status: "DONE" },
    });
  });
}

export async function listDeliveries(filters: any = {}) {
  const { status, warehouseId, customerName, dateFrom, dateTo } = filters;

  const where: any = {};
  if (status) where.status = status;
  if (customerName)
    where.customerName = { contains: customerName, mode: "insensitive" };
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const deliveries = await prisma.deliveryOrder.findMany({
    where,
    include: {
      lines: {
        include: {
          product: true,
          sourceLocation: { include: { warehouse: true } },
        },
      },
      createdBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  let filteredDeliveries = deliveries;
  if (warehouseId) {
    filteredDeliveries = deliveries.filter((d) =>
      d.lines.some((l) => l.sourceLocation.warehouseId === warehouseId)
    );
  }

  return filteredDeliveries.map((d) => transformOperation(d, "DELIVERY"));
}

export async function getDeliveryById(id: string) {
  const delivery = await prisma.deliveryOrder.findUnique({
    where: { id },
    include: {
      lines: {
        include: {
          product: true,
          sourceLocation: { include: { warehouse: true } },
        },
      },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });
  return delivery ? transformOperation(delivery, "DELIVERY") : null;
}

export async function createDelivery(
  data: {
    code: string;
    customerName?: string;
    scheduledDate?: string;
    lines: Array<{
      productId: string;
      sourceLocationId: string;
      quantity: number;
    }>;
  },
  userId?: string
) {
  return prisma.deliveryOrder.create({
    data: {
      code: data.code,
      customerName: data.customerName,
      scheduledDate: data.scheduledDate
        ? new Date(data.scheduledDate)
        : undefined,
      createdById: userId,
      lines: {
        create: data.lines,
      },
    },
    include: { lines: true },
  });
}

export async function updateDelivery(
  id: string,
  data: Partial<{
    customerName: string;
    scheduledDate: string;
    status: OperationStatus;
  }>
) {
  return prisma.deliveryOrder.update({
    where: { id },
    data: {
      ...data,
      scheduledDate: data.scheduledDate
        ? new Date(data.scheduledDate)
        : undefined,
    },
  });
}

export async function validateDelivery(id: string) {
  return prisma.$transaction(async (tx) => {
    const delivery = await tx.deliveryOrder.findUnique({
      where: { id },
      include: { lines: true },
    });

    if (!delivery) throw new Error("Delivery not found");
    if (delivery.status === "DONE")
      throw new Error("Delivery already validated");

    for (const line of delivery.lines) {
      const quant = await tx.stockQuant.findUnique({
        where: {
          productId_locationId: {
            productId: line.productId,
            locationId: line.sourceLocationId,
          },
        },
      });

      if (!quant || quant.quantity < line.quantity) {
        throw new Error(
          `Insufficient stock for product ${line.productId} at location ${line.sourceLocationId}`
        );
      }

      await updateStockQuant(
        line.productId,
        line.sourceLocationId,
        -line.quantity
      );
      await tx.stockMove.create({
        data: {
          moveType: "DELIVERY",
          reference: delivery.code,
          productId: line.productId,
          fromLocationId: line.sourceLocationId,
          quantity: line.quantity,
          status: "DONE",
        },
      });
    }

    return tx.deliveryOrder.update({
      where: { id },
      data: { status: "DONE" },
    });
  });
}

export async function listTransfers(filters: any = {}) {
  const { status, dateFrom, dateTo } = filters;

  const where: any = {};
  if (status) where.status = status;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const transfers = await prisma.internalTransfer.findMany({
    where,
    include: {
      lines: {
        include: {
          product: true,
          sourceLocation: { include: { warehouse: true } },
          destinationLocation: { include: { warehouse: true } },
        },
      },
      createdBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return transfers.map((t) => transformOperation(t, "TRANSFER"));
}

export async function getTransferById(id: string) {
  const transfer = await prisma.internalTransfer.findUnique({
    where: { id },
    include: {
      lines: {
        include: {
          product: true,
          sourceLocation: { include: { warehouse: true } },
          destinationLocation: { include: { warehouse: true } },
        },
      },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });
  return transfer ? transformOperation(transfer, "TRANSFER") : null;
}

export async function createTransfer(
  data: {
    code: string;
    scheduledDate?: string;
    lines: Array<{
      productId: string;
      sourceLocationId: string;
      destinationLocationId: string;
      quantity: number;
    }>;
  },
  userId?: string
) {
  return prisma.internalTransfer.create({
    data: {
      code: data.code,
      scheduledDate: data.scheduledDate
        ? new Date(data.scheduledDate)
        : undefined,
      createdById: userId,
      lines: {
        create: data.lines,
      },
    },
    include: { lines: true },
  });
}

export async function updateTransfer(
  id: string,
  data: Partial<{
    scheduledDate: string;
    status: OperationStatus;
  }>
) {
  return prisma.internalTransfer.update({
    where: { id },
    data: {
      ...data,
      scheduledDate: data.scheduledDate
        ? new Date(data.scheduledDate)
        : undefined,
    },
  });
}

export async function validateTransfer(id: string) {
  return prisma.$transaction(async (tx) => {
    const transfer = await tx.internalTransfer.findUnique({
      where: { id },
      include: { lines: true },
    });

    if (!transfer) throw new Error("Transfer not found");
    if (transfer.status === "DONE")
      throw new Error("Transfer already validated");

    for (const line of transfer.lines) {
      const quant = await tx.stockQuant.findUnique({
        where: {
          productId_locationId: {
            productId: line.productId,
            locationId: line.sourceLocationId,
          },
        },
      });

      if (!quant || quant.quantity < line.quantity) {
        throw new Error(
          `Insufficient stock for product ${line.productId} at source location ${line.sourceLocationId}`
        );
      }

      await updateStockQuant(
        line.productId,
        line.sourceLocationId,
        -line.quantity
      );
      await updateStockQuant(
        line.productId,
        line.destinationLocationId,
        line.quantity
      );

      await tx.stockMove.create({
        data: {
          moveType: "INTERNAL",
          reference: transfer.code,
          productId: line.productId,
          fromLocationId: line.sourceLocationId,
          toLocationId: line.destinationLocationId,
          quantity: line.quantity,
          status: "DONE",
        },
      });
    }

    return tx.internalTransfer.update({
      where: { id },
      data: { status: "DONE" },
    });
  });
}

export async function listAdjustments(filters: any = {}) {
  const { status, locationId, dateFrom, dateTo } = filters;

  const where: any = {};
  if (status) where.status = status;
  if (locationId) where.locationId = locationId;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const adjustments = await prisma.inventoryAdjustment.findMany({
    where,
    include: {
      location: { include: { warehouse: true } },
      lines: { include: { product: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return adjustments.map((a) => transformOperation(a, "ADJUSTMENT"));
}

export async function getAdjustmentById(id: string) {
  const adjustment = await prisma.inventoryAdjustment.findUnique({
    where: { id },
    include: {
      location: { include: { warehouse: true } },
      lines: { include: { product: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });
  return adjustment ? transformOperation(adjustment, "ADJUSTMENT") : null;
}

export async function createAdjustment(
  data: {
    code: string;
    locationId: string;
    reason?: string;
    lines: Array<{
      productId: string;
      countedQty: number;
      previousQty: number;
    }>;
  },
  userId?: string
) {
  return prisma.inventoryAdjustment.create({
    data: {
      code: data.code,
      locationId: data.locationId,
      reason: data.reason,
      createdById: userId,
      lines: {
        create: data.lines,
      },
    },
    include: { lines: true },
  });
}

export async function updateAdjustment(
  id: string,
  data: Partial<{
    reason: string;
    status: OperationStatus;
  }>
) {
  return prisma.inventoryAdjustment.update({
    where: { id },
    data,
  });
}

export async function validateAdjustment(id: string) {
  return prisma.$transaction(async (tx) => {
    const adjustment = await tx.inventoryAdjustment.findUnique({
      where: { id },
      include: { lines: true },
    });

    if (!adjustment) throw new Error("Adjustment not found");
    if (adjustment.status === "DONE")
      throw new Error("Adjustment already validated");

    for (const line of adjustment.lines) {
      const delta = line.countedQty - line.previousQty;

      if (delta !== 0) {
        await updateStockQuant(line.productId, adjustment.locationId, delta);
        await tx.stockMove.create({
          data: {
            moveType: "ADJUSTMENT",
            reference: adjustment.code,
            productId: line.productId,
            toLocationId: delta > 0 ? adjustment.locationId : undefined,
            fromLocationId: delta < 0 ? adjustment.locationId : undefined,
            quantity: Math.abs(delta),
            status: "DONE",
          },
        });
      }
    }

    return tx.inventoryAdjustment.update({
      where: { id },
      data: { status: "DONE" },
    });
  });
}
