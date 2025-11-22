import { ProductCategory } from '@/types'

const mockCategoriesData: ProductCategory[] = [
  { id: '1', name: 'Electronics', description: 'Electronic devices and components' },
  { id: '2', name: 'Furniture', description: 'Office and home furniture' },
  { id: '3', name: 'Office Supplies', description: 'Office consumables and supplies' },
  { id: '4', name: 'Tools', description: 'Hand and power tools' },
  { id: '5', name: 'Safety Equipment', description: 'Safety and protective equipment' },
]

export const mockCategories = {
  getAll: async (): Promise<ProductCategory[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return [...mockCategoriesData]
  },
}

