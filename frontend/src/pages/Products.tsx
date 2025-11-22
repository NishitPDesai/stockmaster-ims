import { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { fetchProducts, createProduct, updateProduct, setFilters } from '@/store/slices/productSlice'
import { fetchCategories } from '@/store/slices/categorySlice'
import { DataTable, Column } from '@/components/common/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Product } from '@/types'
import { Plus, Search } from 'lucide-react'
import { ProductForm } from '@/components/forms/ProductForm'

export function Products() {
  const dispatch = useAppDispatch()
  const { items, isLoading, filters } = useAppSelector((state) => state.products)
  const { items: categories } = useAppSelector((state) => state.categories)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    try {
      dispatch(fetchProducts())
      dispatch(fetchCategories())
    } catch (error) {
      console.error('Error loading products/categories:', error)
    }
  }, [dispatch])

  const filteredProducts = (items || []).filter((product) => {
    const matchesSearch = !filters.search || 
      product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      product.sku.toLowerCase().includes(filters.search.toLowerCase())
    const matchesCategory = !filters.category || product.category === filters.category
    return matchesSearch && matchesCategory
  })

  const columns: Column<Product>[] = [
    {
      key: 'sku',
      header: 'SKU',
      cell: (row) => <span className="font-mono text-sm">{row.sku}</span>,
    },
    {
      key: 'name',
      header: 'Product Name',
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      cell: (row) => row.category,
    },
    {
      key: 'uom',
      header: 'UOM',
      cell: (row) => row.uom,
    },
    {
      key: 'stock',
      header: 'Total Stock',
      cell: (row) => {
        const totalStock = Object.values(row.stockPerWarehouse || {}).reduce((sum, qty) => sum + qty, 0)
        return <span>{totalStock}</span>
      },
    },
  ]

  const handleCreate = () => {
    setSelectedProduct(null)
    setIsFormOpen(true)
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setIsFormOpen(true)
  }

  // const handleDelete = async (id: string) => {
  //   if (window.confirm('Are you sure you want to delete this product?')) {
  //     await dispatch(deleteProduct(id))
  //   }
  // }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
            className="pl-10"
          />
        </div>
        <Select
          value={filters.category || 'all'}
          onValueChange={(value) => dispatch(setFilters({ category: value === 'all' ? '' : value }))}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories && categories.length > 0 && categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredProducts}
        isLoading={isLoading}
        emptyMessage="No products found"
        onRowClick={handleEdit}
      />

      {isFormOpen && (
        <ProductForm
          product={selectedProduct}
          categories={categories || []}
          onClose={() => {
            setIsFormOpen(false)
            setSelectedProduct(null)
          }}
          onSave={async (data) => {
            if (selectedProduct) {
              await dispatch(updateProduct({ id: selectedProduct.id, data }))
            } else {
              await dispatch(createProduct(data))
            }
            setIsFormOpen(false)
            setSelectedProduct(null)
          }}
        />
      )}
    </div>
  )
}

