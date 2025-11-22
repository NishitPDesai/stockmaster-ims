import { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { fetchWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from '@/store/slices/warehouseSlice'
import { DataTable, Column } from '@/components/common/DataTable'
import { Button } from '@/components/ui/button'
import { Warehouse } from '@/types'
import { Plus, Trash2 } from 'lucide-react'
import { WarehouseForm } from '@/components/forms/WarehouseForm'
import { hasPermission, canDelete, canAccessSettings } from '@/lib/permissions'
import { Navigate } from 'react-router-dom'
import { toast } from '@/lib/toast'

export function Warehouses() {
  const dispatch = useAppDispatch()
  const { warehouses, isLoading } = useAppSelector((state) => state.warehouses)
  const user = useAppSelector((state) => state.auth.user)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)

  useEffect(() => {
    dispatch(fetchWarehouses())
  }, [dispatch])

  // Check if user can access settings
  if (!canAccessSettings(user)) {
    return <Navigate to="/dashboard" replace />
  }

  const canCreate = hasPermission(user, 'warehouses.create')
  const canEdit = hasPermission(user, 'warehouses.edit')
  const canDeleteWarehouses = canDelete(user, 'warehouse')

  const columns: Column<Warehouse>[] = [
    {
      key: 'code',
      header: 'Code',
      cell: (row) => <span className="font-mono">{row.code}</span>,
    },
    {
      key: 'name',
      header: 'Name',
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: 'location',
      header: 'Location',
      cell: (row) => `${row.city || ''}${row.city && row.country ? ', ' : ''}${row.country || ''}`,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => (
        <span className={row.isActive ? 'text-green-600' : 'text-gray-500'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    ...(canDeleteWarehouses ? [{
      key: 'actions',
      header: 'Actions',
      cell: (row: Warehouse) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            handleDelete(row.id)
          }}
          title="Delete"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    }] : []),
  ]

  const handleCreate = () => {
    setSelectedWarehouse(null)
    setIsFormOpen(true)
  }

  const handleEdit = (warehouse: Warehouse) => {
    if (canEdit) {
      setSelectedWarehouse(warehouse)
      setIsFormOpen(true)
    }
  }

  const handleDelete = async (id: string) => {
    if (canDeleteWarehouses && window.confirm('Are you sure you want to delete this warehouse?')) {
      try {
        await dispatch(deleteWarehouse(id)).unwrap()
        toast('Warehouse deleted successfully', 'success')
      } catch (error) {
        toast('Failed to delete warehouse', 'error')
      }
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Warehouse</h1>
        </div>
        {canCreate && (
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Warehouse
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={warehouses}
        isLoading={isLoading}
        emptyMessage="No warehouses found"
        onRowClick={canEdit ? handleEdit : undefined}
      />

      {isFormOpen && (
        <WarehouseForm
          warehouse={selectedWarehouse}
          onClose={() => {
            setIsFormOpen(false)
            setSelectedWarehouse(null)
          }}
          onSave={async (data) => {
            try {
              if (selectedWarehouse) {
                await dispatch(updateWarehouse({ id: selectedWarehouse.id, data })).unwrap()
                toast('Warehouse updated successfully', 'success')
              } else {
                await dispatch(createWarehouse(data)).unwrap()
                toast('Warehouse created successfully', 'success')
              }
              setIsFormOpen(false)
              setSelectedWarehouse(null)
            } catch (error) {
              toast('Failed to save warehouse', 'error')
            }
          }}
        />
      )}
    </div>
  )
}

