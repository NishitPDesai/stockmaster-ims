import prisma from "../../lib/prisma";

export async function listLocations(warehouseId?: string) {
  return prisma.location.findMany({
    where: {
      isActive: true,
      ...(warehouseId && { warehouseId }),
    },
    include: {
      warehouse: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getLocationById(id: string) {
  return prisma.location.findUnique({
    where: { id },
    include: {
      warehouse: true,
    },
  });
}

export async function createLocation(data: {
  name: string;
  code: string;
  warehouseId: string;
  description?: string;
}) {
  return prisma.location.create({ data });
}

export async function updateLocation(
  id: string,
  data: Partial<{
    name: string;
    code: string;
    description: string;
    isActive: boolean;
  }>
) {
  return prisma.location.update({ where: { id }, data });
}

export async function deleteLocation(id: string) {
  await prisma.location.update({
    where: { id },
    data: { isActive: false },
  });
}
