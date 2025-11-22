export interface Warehouse {
  id: string
  name: string
  code: string
  address?: string
  city?: string
  country?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Location {
  id: string
  warehouseId: string
  warehouseName?: string
  name: string
  code: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateWarehouseDto {
  name: string
  code: string
  address?: string
  city?: string
  country?: string
}

export interface CreateLocationDto {
  warehouseId: string
  name: string
  code: string
  description?: string
}

