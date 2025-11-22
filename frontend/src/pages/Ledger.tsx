import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { fetchLedger, setFilters } from '@/store/slices/ledgerSlice'
import { fetchWarehouses } from '@/store/slices/warehouseSlice'
import { DataTable, Column } from '@/components/common/DataTable'
import { FilterBar } from '@/components/common/FilterBar'
import { StatusBadge } from '@/components/common/StatusBadge'
import { MoveLog } from '@/types'
import { formatDateTime } from '@/lib/format'
import { DocumentTypeLabels } from '@/types/Status'

export function Ledger() {
  const dispatch = useAppDispatch()
  const { items, isLoading, filters } = useAppSelector((state) => state.ledger)
  const { warehouses } = useAppSelector((state) => state.warehouses)

  useEffect(() => {
    dispatch(fetchWarehouses())
  }, [dispatch])

  useEffect(() => {
    // Fetch ledger data when component mounts or filters change
    dispatch(fetchLedger(filters || {}))
  }, [dispatch, filters])

  const columns: Column<MoveLog>[] = [
    {
      key: 'documentNumber',
      header: 'Document #',
      cell: (row) => <span className="font-mono">{row.reference}</span>,
    },
    {
      key: 'documentType',
      header: 'Type',
      cell: (row) => DocumentTypeLabels[row.moveType],
    },
    {
      key: 'product',
      header: 'Product',
      cell: (row) => (
        <div>
          <div className="font-medium">{row.productName}</div>
          <div className="text-xs text-muted-foreground">{row.productSku}</div>
        </div>
      ),
    },
    {
      key: 'warehouse',
      header: 'Warehouse',
      cell: (row) => row.fromWarehouseName,
    },
    {
      key: 'movement',
      header: 'Movement',
      cell: (row) => (
        <div>
          <div className="font-medium">{row.quantity} {row.movementType}</div>
          <div className="text-xs text-muted-foreground">
            {row.quantityBefore} → {row.quantityAfter}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'createdAt',
      header: 'Date',
      cell: (row) => formatDateTime(row.createdAt),
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Move History</h1>
      </div>

      <FilterBar
        filters={filters}
        onFiltersChange={(newFilters) => dispatch(setFilters(newFilters))}
        warehouses={warehouses || []}
        showDateRange={true}
      />

      <DataTable
        columns={columns}
        data={items || []}
        isLoading={isLoading}
        emptyMessage="No movements found"
      />
    </div>
  )
}

