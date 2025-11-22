import { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { fetchWarehouses, createWarehouse, updateWarehouse } from '@/store/slices/warehouseSlice'
import { DataTable, Column } from '@/components/common/DataTable'
import { Button } from '@/components/ui/button'
import { Warehouse } from '@/types'
import { Plus } from 'lucide-react'
import { WarehouseForm } from '@/components/forms/WarehouseForm'

export function Warehouses() {
  const dispatch = useAppDispatch()
  const { warehouses, isLoading } = useAppSelector((state) => state.warehouses)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)

  useEffect(() => {
    dispatch(fetchWarehouses())
  }, [dispatch])

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
  ]

  const handleCreate = () => {
    setSelectedWarehouse(null)
    setIsFormOpen(true)
  }

  const handleEdit = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse)
    setIsFormOpen(true)
  }

  // const handleDelete = async (id: string) => {
  //   if (window.confirm('Are you sure you want to delete this warehouse?')) {
  //     await dispatch(deleteWarehouse(id))
  //   }
  // }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Warehouses</h1>
          <p className="text-muted-foreground">Manage warehouse locations</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Warehouse
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={warehouses}
        isLoading={isLoading}
        emptyMessage="No warehouses found"
        onRowClick={handleEdit}
      />

      {isFormOpen && (
        <WarehouseForm
          warehouse={selectedWarehouse}
          onClose={() => {
            setIsFormOpen(false)
            setSelectedWarehouse(null)
          }}
          onSave={async (data) => {
            if (selectedWarehouse) {
              await dispatch(updateWarehouse({ id: selectedWarehouse.id, data }))
            } else {
              await dispatch(createWarehouse(data))
            }
            setIsFormOpen(false)
            setSelectedWarehouse(null)
          }}
        />
      )}
    </div>
  )
}

