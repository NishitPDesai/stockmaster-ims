import prisma from "../../lib/prisma";

export async function listWarehouses() {
  return prisma.warehouse.findMany({
    where: { isActive: true },
    include: {
      locations: { where: { isActive: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getWarehouseById(id: string) {
  return prisma.warehouse.findUnique({
    where: { id },
    include: {
      locations: { where: { isActive: true } },
    },
  });
}

export async function createWarehouse(data: {
  name: string;
  code: string;
  address?: string;
  city?: string;
  country?: string;
}) {
  return prisma.warehouse.create({ data });
}

export async function updateWarehouse(
  id: string,
  data: Partial<{
    name: string;
    code: string;
    address: string;
    city: string;
    country: string;
    isActive: boolean;
  }>
) {
  return prisma.warehouse.update({ where: { id }, data });
}

export async function deleteWarehouse(id: string) {
  await prisma.warehouse.update({
    where: { id },
    data: { isActive: false },
  });
}
