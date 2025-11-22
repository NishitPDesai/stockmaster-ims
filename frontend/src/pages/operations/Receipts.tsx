import { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { fetchOperations, setFilters } from '@/store/slices/operationSlice'
import { fetchWarehouses } from '@/store/slices/warehouseSlice'
import { DataTable, Column } from '@/components/common/DataTable'
import { FilterBar } from '@/components/common/FilterBar'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Operation, DocumentType } from '@/types'
import { Plus } from 'lucide-react'
import { formatDateTime } from '@/lib/format'
import { OperationForm } from '@/components/forms/OperationForm'

export function Receipts() {
  const dispatch = useAppDispatch()
  const { items, isLoading, filters } = useAppSelector((state) => state.operations)
  const { warehouses } = useAppSelector((state) => state.warehouses)
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    try {
      dispatch(fetchWarehouses())
      dispatch(fetchOperations({ documentType: DocumentType.RECEIPT }))
    } catch (error) {
      console.error('Error loading receipts:', error)
    }
  }, [dispatch])

  const receipts = (items || []).filter((o) => o.documentType === DocumentType.RECEIPT)

  const columns: Column<Operation>[] = [
    {
      key: 'documentNumber',
      header: 'Document #',
      cell: (row) => <span className="font-mono">{row.documentNumber}</span>,
    },
    {
      key: 'warehouse',
      header: 'Warehouse',
      cell: (row) => row.warehouseName || '-',
    },
    {
      key: 'supplier',
      header: 'Supplier',
      cell: (row) => row.supplierName || '-',
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'createdAt',
      header: 'Created',
      cell: (row) => formatDateTime(row.createdAt),
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Receipts</h1>
          <p className="text-muted-foreground">Manage incoming stock receipts</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Receipt
        </Button>
      </div>

      <FilterBar
        filters={filters}
        onFiltersChange={(newFilters) => {
          dispatch(setFilters(newFilters))
          dispatch(fetchOperations({ ...filters, ...newFilters, documentType: DocumentType.RECEIPT }))
        }}
        warehouses={warehouses || []}
        showDocumentType={false}
        showCategory={false}
      />

      <DataTable
        columns={columns}
        data={receipts}
        isLoading={isLoading}
        emptyMessage="No receipts found"
      />

      {isFormOpen && (
        <OperationForm
          documentType={DocumentType.RECEIPT}
          warehouses={warehouses || []}
          onClose={() => setIsFormOpen(false)}
          onSave={async () => {
            await dispatch(fetchOperations({ documentType: DocumentType.RECEIPT }))
            setIsFormOpen(false)
          }}
        />
      )}
    </div>
  )
}

