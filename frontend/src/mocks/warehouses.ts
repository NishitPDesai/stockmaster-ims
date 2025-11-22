import { Warehouse, Location, CreateWarehouseDto, CreateLocationDto } from '@/types'

const mockWarehousesData: Warehouse[] = [
  {
    id: '1',
    name: 'Main Warehouse',
    code: 'WH-001',
    address: '123 Industrial Ave',
    city: 'New York',
    country: 'USA',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Secondary Warehouse',
    code: 'WH-002',
    address: '456 Commerce St',
    city: 'Los Angeles',
    country: 'USA',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const mockLocationsData: Location[] = [
  {
    id: '1',
    warehouseId: '1',
    warehouseName: 'Main Warehouse',
    name: 'Aisle A',
    code: 'LOC-A-001',
    description: 'Main storage aisle',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    warehouseId: '1',
    warehouseName: 'Main Warehouse',
    name: 'Aisle B',
    code: 'LOC-B-001',
    description: 'Secondary storage aisle',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const mockWarehouses = {
  getAll: async (): Promise<Warehouse[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return [...mockWarehousesData]
  },

  create: async (data: CreateWarehouseDto): Promise<Warehouse> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newWarehouse: Warehouse = {
      id: String(mockWarehousesData.length + 1),
      ...data,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockWarehousesData.push(newWarehouse)
    return newWarehouse
  },

  update: async (id: string, data: Partial<CreateWarehouseDto>): Promise<Warehouse> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = mockWarehousesData.findIndex((w) => w.id === id)
    if (index === -1) throw new Error('Warehouse not found')
    mockWarehousesData[index] = {
      ...mockWarehousesData[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    return mockWarehousesData[index]
  },

  delete: async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const index = mockWarehousesData.findIndex((w) => w.id === id)
    if (index !== -1) {
      mockWarehousesData.splice(index, 1)
    }
  },

  getLocations: async (warehouseId?: string): Promise<Location[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    if (warehouseId) {
      return mockLocationsData.filter((l) => l.warehouseId === warehouseId)
    }
    return [...mockLocationsData]
  },

  createLocation: async (data: CreateLocationDto): Promise<Location> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const warehouse = mockWarehousesData.find((w) => w.id === data.warehouseId)
    const newLocation: Location = {
      id: String(mockLocationsData.length + 1),
      ...data,
      warehouseName: warehouse?.name,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockLocationsData.push(newLocation)
    return newLocation
  },

  updateLocation: async (id: string, data: Partial<CreateLocationDto>): Promise<Location> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = mockLocationsData.findIndex((l) => l.id === id)
    if (index === -1) throw new Error('Location not found')
    mockLocationsData[index] = {
      ...mockLocationsData[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    return mockLocationsData[index]
  },

  deleteLocation: async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const index = mockLocationsData.findIndex((l) => l.id === id)
    if (index !== -1) {
      mockLocationsData.splice(index, 1)
    }
  },
}

