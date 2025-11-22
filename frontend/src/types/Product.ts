export interface Product {
  id: string
  name: string
  sku: string
  category: string
  uom: string // Unit of Measure
  initialStock: number
  stockPerWarehouse: Record<string, number> // warehouseId -> quantity
  unitCost?: number // Per unit cost in Rs
  createdAt: string
  updatedAt: string
}

export interface ProductCategory {
  id: string
  name: string
  description?: string
}

export interface CreateProductDto {
  name: string
  sku: string
  category: string
  uom: string
  initialStock: number
  unitCost?: number
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

