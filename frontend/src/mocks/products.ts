import { Product, CreateProductDto, UpdateProductDto } from '@/types'

export const mockProductsData: Product[] = [
  {
    id: '1',
    name: 'Desk',
    sku: 'DSK-001',
    category: 'Furniture',
    uom: 'Unit',
    initialStock: 50,
    stockPerWarehouse: { '1': 30, '2': 20 },
    unitCost: 3000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Table',
    sku: 'TBL-001',
    category: 'Furniture',
    uom: 'Unit',
    initialStock: 50,
    stockPerWarehouse: { '1': 30, '2': 20 },
    unitCost: 3000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Laptop Computer',
    sku: 'LAP-001',
    category: 'Electronics',
    uom: 'Unit',
    initialStock: 50,
    stockPerWarehouse: { '1': 30, '2': 20 },
    unitCost: 50000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Office Chair',
    sku: 'CHR-001',
    category: 'Furniture',
    uom: 'Unit',
    initialStock: 100,
    stockPerWarehouse: { '1': 60, '2': 40 },
    unitCost: 5000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Printer Paper',
    sku: 'PAP-001',
    category: 'Office Supplies',
    uom: 'Ream',
    initialStock: 500,
    stockPerWarehouse: { '1': 300, '2': 200 },
    unitCost: 500,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const mockProducts = {
  getAll: async (): Promise<Product[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return [...mockProductsData]
  },

  getById: async (id: string): Promise<Product> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const product = mockProductsData.find((p) => p.id === id)
    if (!product) throw new Error('Product not found')
    return product
  },

  create: async (data: CreateProductDto): Promise<Product> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newProduct: Product = {
      id: String(mockProductsData.length + 1),
      ...data,
      stockPerWarehouse: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockProductsData.push(newProduct)
    return newProduct
  },

  update: async (id: string, data: UpdateProductDto): Promise<Product> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = mockProductsData.findIndex((p) => p.id === id)
    if (index === -1) throw new Error('Product not found')
    mockProductsData[index] = {
      ...mockProductsData[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    return mockProductsData[index]
  },

  delete: async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const index = mockProductsData.findIndex((p) => p.id === id)
    if (index !== -1) {
      mockProductsData.splice(index, 1)
    }
  },
}

