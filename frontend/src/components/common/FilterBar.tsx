import { DocumentType, OperationStatus, DocumentTypeLabels, StatusLabels } from '@/types/Status'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { OperationFilters } from '@/types'

interface FilterBarProps {
  filters: OperationFilters
  onFiltersChange: (filters: Partial<OperationFilters>) => void
  warehouses?: Array<{ id: string; name: string }>
  categories?: Array<{ id: string; name: string }>
  showDocumentType?: boolean
  showStatus?: boolean
  showWarehouse?: boolean
  showCategory?: boolean
  showDateRange?: boolean
}

export function FilterBar({
  filters,
  onFiltersChange,
  warehouses = [],
  categories = [],
  showDocumentType = true,
  showStatus = true,
  showWarehouse = true,
  showCategory = false,
  showDateRange = false,
}: FilterBarProps) {
  const clearFilters = () => {
    onFiltersChange({
      documentType: undefined,
      status: undefined,
      warehouseId: undefined,
      category: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    })
  }

  const hasActiveFilters = Boolean(
    filters.documentType ||
    filters.status ||
    filters.warehouseId ||
    filters.category ||
    filters.dateFrom ||
    filters.dateTo
  )

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 bg-card rounded-2xl border shadow-sm">
      {showDocumentType && (
        <div className="flex flex-col gap-2 min-w-[150px]">
          <Label htmlFor="document-type">Document Type</Label>
          <Select
            value={filters.documentType || 'all'}
            onValueChange={(value) =>
              onFiltersChange({ documentType: value === 'all' ? undefined : (value as DocumentType) })
            }
          >
            <SelectTrigger id="document-type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.values(DocumentType).map((type) => (
                <SelectItem key={type} value={type}>
                  {DocumentTypeLabels[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showStatus && (
        <div className="flex flex-col gap-2 min-w-[150px]">
          <Label htmlFor="status">Status</Label>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) =>
              onFiltersChange({ status: value === 'all' ? undefined : (value as OperationStatus) })
            }
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.values(OperationStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {StatusLabels[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showWarehouse && warehouses.length > 0 && (
        <div className="flex flex-col gap-2 min-w-[150px]">
          <Label htmlFor="warehouse">Warehouse</Label>
          <Select
            value={filters.warehouseId || 'all'}
            onValueChange={(value) =>
              onFiltersChange({ warehouseId: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger id="warehouse">
              <SelectValue placeholder="All Warehouses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Warehouses</SelectItem>
              {warehouses.map((warehouse) => (
                <SelectItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showCategory && categories.length > 0 && (
        <div className="flex flex-col gap-2 min-w-[150px]">
          <Label htmlFor="category">Category</Label>
          <Select
            value={filters.category || 'all'}
            onValueChange={(value) =>
              onFiltersChange({ category: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showDateRange && (
        <>
          <div className="flex flex-col gap-2 min-w-[150px]">
            <Label htmlFor="date-from">From Date</Label>
            <Input
              id="date-from"
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => onFiltersChange({ dateFrom: e.target.value || undefined })}
            />
          </div>
          <div className="flex flex-col gap-2 min-w-[150px]">
            <Label htmlFor="date-to">To Date</Label>
            <Input
              id="date-to"
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => onFiltersChange({ dateTo: e.target.value || undefined })}
            />
          </div>
        </>
      )}

      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="gap-2">
          <X className="h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  )
}

