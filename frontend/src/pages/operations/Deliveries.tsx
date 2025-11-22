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

export function Deliveries() {
  const dispatch = useAppDispatch()
  const { items, isLoading, filters } = useAppSelector((state) => state.operations)
  const { warehouses } = useAppSelector((state) => state.warehouses)
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchWarehouses())
    dispatch(fetchOperations({ documentType: DocumentType.DELIVERY }))
  }, [dispatch])

  const deliveries = (items || []).filter((o) => o.documentType === DocumentType.DELIVERY)

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
      key: 'customer',
      header: 'Customer',
      cell: (row) => row.customerName || '-',
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
          <h1 className="text-3xl font-bold">Deliveries</h1>
          <p className="text-muted-foreground">Manage outgoing stock deliveries</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Delivery
        </Button>
      </div>

      <FilterBar
        filters={filters}
        onFiltersChange={(newFilters) => {
          dispatch(setFilters(newFilters))
          dispatch(fetchOperations({ ...filters, ...newFilters, documentType: DocumentType.DELIVERY }))
        }}
        warehouses={warehouses || []}
        showDocumentType={false}
        showCategory={false}
      />

      <DataTable
        columns={columns}
        data={deliveries}
        isLoading={isLoading}
        emptyMessage="No deliveries found"
      />

      {isFormOpen && (
        <OperationForm
          documentType={DocumentType.DELIVERY}
          warehouses={warehouses || []}
          onClose={() => setIsFormOpen(false)}
          onSave={async () => {
            await dispatch(fetchOperations({ documentType: DocumentType.DELIVERY }))
            setIsFormOpen(false)
          }}
        />
      )}
    </div>
  )
}

