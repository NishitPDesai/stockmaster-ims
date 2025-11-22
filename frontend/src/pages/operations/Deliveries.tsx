import { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { fetchOperations, setFilters, changeOperationStatus, setSelectedOperation, updateOperation, createOperation } from '@/store/slices/operationSlice'
import { fetchWarehouses } from '@/store/slices/warehouseSlice'
import { fetchProducts } from '@/store/slices/productSlice'
import { DataTable, Column } from '@/components/common/DataTable'
import { FilterBar } from '@/components/common/FilterBar'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Operation, DocumentType } from '@/types'
import { Plus, Download, Eye, Edit, Search, List, LayoutGrid } from 'lucide-react'
import { formatDateTime, formatDate } from '@/lib/format'
import { OperationForm } from '@/components/forms/OperationForm'
import { OperationDetails } from '@/components/common/OperationDetails'
import { StatusChangeDropdown } from '@/components/common/StatusChangeDropdown'
import { KanbanView } from '@/components/common/KanbanView'
import { exportToCSV } from '@/lib/export'
import { hasPermission } from '@/lib/permissions'
import { OperationStatus, StatusLabels } from '@/types/Status'
import { toast } from '@/lib/toast'
import { Input } from '@/components/ui/input'

export function Deliveries() {
  const dispatch = useAppDispatch()
  const { items, isLoading, filters, selectedOperation } = useAppSelector((state) => state.operations)
  const { warehouses } = useAppSelector((state) => state.warehouses)
  const user = useAppSelector((state) => state.auth.user)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    dispatch(fetchWarehouses())
    dispatch(fetchProducts())
    dispatch(fetchOperations({ documentType: DocumentType.DELIVERY }))
  }, [dispatch])

  const canCreate = hasPermission(user, 'operations.create')
  const canEdit = hasPermission(user, 'operations.edit')
  const canValidate = hasPermission(user, 'operations.validate')
  const canComplete = hasPermission(user, 'operations.complete')
  const canCancel = hasPermission(user, 'operations.cancel')
  const isManager = user?.role === 'manager'

  const handleViewDetails = (operation: Operation) => {
    dispatch(setSelectedOperation(operation))
  }

  const handleEdit = (operation: Operation) => {
    if (operation.status === OperationStatus.DRAFT && canEdit) {
      setEditingOperation(operation)
      setIsFormOpen(true)
    }
  }

  const handleStatusChange = async (id: string, status: OperationStatus) => {
    try {
      await dispatch(changeOperationStatus({ id, status })).unwrap()
      await dispatch(fetchOperations({ documentType: DocumentType.DELIVERY }))
      dispatch(setSelectedOperation(null))
      toast(`Operation status changed to ${status}`, 'success')
    } catch (error) {
      toast('Failed to change operation status', 'error')
    }
  }

  const handleExport = () => {
    const exportData = deliveries.map((d) => ({
      'Document Number': d.documentNumber,
      'Warehouse': d.warehouseName || '',
      'Customer': d.customerName || '',
      'Status': d.status,
      'Created': formatDateTime(d.createdAt),
      'Line Items': d.lineItems.length,
    }))
    exportToCSV(exportData, 'deliveries')
    toast('Deliveries exported successfully', 'success')
  }

  const allDeliveries = (items || []).filter((o) => o.documentType === DocumentType.DELIVERY)
  
  // Filter by search query
  const deliveries = allDeliveries.filter((d) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      d.documentNumber.toLowerCase().includes(query) ||
      (d.customerName && d.customerName.toLowerCase().includes(query)) ||
      (d.warehouseName && d.warehouseName.toLowerCase().includes(query)) ||
      (d.deliveryAddress && d.deliveryAddress.toLowerCase().includes(query))
    )
  })

  const columns: Column<Operation>[] = [
    {
      key: 'documentNumber',
      header: 'Reference',
      cell: (row) => (
        <button
          onClick={() => handleViewDetails(row)}
          className="font-mono text-primary hover:underline"
        >
          {row.documentNumber}
        </button>
      ),
    },
    {
      key: 'from',
      header: 'From',
      cell: (row) => row.warehouseName || row.warehouseCode || '-',
    },
    {
      key: 'to',
      header: 'To',
      cell: (row) => row.customerName || row.deliveryAddress || '-',
    },
    {
      key: 'contact',
      header: 'Contact',
      cell: (row) => row.customerName || '-',
    },
    {
      key: 'scheduleDate',
      header: 'Schedule date',
      cell: (row) => row.scheduleDate ? formatDate(row.scheduleDate) : '-',
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => (
        <StatusChangeDropdown
          currentStatus={row.status}
          onStatusChange={(newStatus) => handleStatusChange(row.id, newStatus)}
          canValidate={canValidate}
          canComplete={canComplete}
          canCancel={canCancel}
          isManager={isManager}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleViewDetails(row)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {row.status === OperationStatus.DRAFT && canEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(row)}
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deliveries</h1>
        </div>
        <div className="flex items-center gap-2">
          {showSearch ? (
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by reference, contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pr-8"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => {
                  setShowSearch(false)
                  setSearchQuery('')
                }}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="icon"
              title="Search"
              onClick={() => setShowSearch(true)}
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            title="List View"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'outline'}
            size="icon"
            title="Kanban View"
            onClick={() => setViewMode('kanban')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          {canCreate && (
            <Button onClick={() => {
              setEditingOperation(null)
              setIsFormOpen(true)
            }}>
              <Plus className="mr-2 h-4 w-4" />
              NEW Delivery
            </Button>
          )}
        </div>
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

      {viewMode === 'list' ? (
        <DataTable
          columns={columns}
          data={deliveries}
          isLoading={isLoading}
          emptyMessage="No deliveries found"
        />
      ) : (
        <KanbanView
          operations={deliveries}
          onViewDetails={handleViewDetails}
          statusLabels={StatusLabels}
        />
      )}

      {isFormOpen && (
        <OperationForm
          documentType={DocumentType.DELIVERY}
          warehouses={warehouses || []}
          operation={editingOperation}
          onClose={() => {
            setIsFormOpen(false)
            setEditingOperation(null)
          }}
          onSave={async (data) => {
            if (editingOperation) {
              await dispatch(updateOperation({ id: editingOperation.id, data })).unwrap()
              toast('Delivery updated successfully', 'success')
            } else {
              await dispatch(createOperation(data)).unwrap()
              toast('Delivery created successfully', 'success')
            }
            await dispatch(fetchOperations({ documentType: DocumentType.DELIVERY }))
            setIsFormOpen(false)
            setEditingOperation(null)
          }}
        />
      )}

      {selectedOperation && (
        <OperationDetails
          operation={selectedOperation}
          onClose={() => dispatch(setSelectedOperation(null))}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}

