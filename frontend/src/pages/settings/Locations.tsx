import { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { fetchLocations, createLocation, updateLocation } from '@/store/slices/warehouseSlice'
import { fetchWarehouses } from '@/store/slices/warehouseSlice'
import { DataTable, Column } from '@/components/common/DataTable'
import { Button } from '@/components/ui/button'
import { Location } from '@/types'
import { Plus } from 'lucide-react'
import { LocationForm } from '@/components/forms/LocationForm'

export function Locations() {
  const dispatch = useAppDispatch()
  const { locations, warehouses, isLoading } = useAppSelector((state) => state.warehouses)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  useEffect(() => {
    dispatch(fetchWarehouses())
    dispatch(fetchLocations())
  }, [dispatch])

  const columns: Column<Location>[] = [
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
      key: 'warehouse',
      header: 'Warehouse',
      cell: (row) => row.warehouseName || '-',
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
    setSelectedLocation(null)
    setIsFormOpen(true)
  }

  const handleEdit = (location: Location) => {
    setSelectedLocation(location)
    setIsFormOpen(true)
  }

  // const handleDelete = async (id: string) => {
  //   if (window.confirm('Are you sure you want to delete this location?')) {
  //     await dispatch(deleteLocation(id))
  //   }
  // }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Locations</h1>
          <p className="text-muted-foreground">Manage warehouse locations</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Location
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={locations}
        isLoading={isLoading}
        emptyMessage="No locations found"
        onRowClick={handleEdit}
      />

      {isFormOpen && (
        <LocationForm
          location={selectedLocation}
          warehouses={warehouses}
          onClose={() => {
            setIsFormOpen(false)
            setSelectedLocation(null)
          }}
          onSave={async (data) => {
            if (selectedLocation) {
              await dispatch(updateLocation({ id: selectedLocation.id, data }))
            } else {
              await dispatch(createLocation(data))
            }
            setIsFormOpen(false)
            setSelectedLocation(null)
          }}
        />
      )}
    </div>
  )
}

