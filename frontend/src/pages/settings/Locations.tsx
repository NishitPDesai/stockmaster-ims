import { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { fetchLocations, createLocation, updateLocation, deleteLocation } from '@/store/slices/warehouseSlice'
import { fetchWarehouses } from '@/store/slices/warehouseSlice'
import { DataTable, Column } from '@/components/common/DataTable'
import { Button } from '@/components/ui/button'
import { Location } from '@/types'
import { Plus, Trash2 } from 'lucide-react'
import { LocationForm } from '@/components/forms/LocationForm'
import { hasPermission, canDelete, canAccessSettings } from '@/lib/permissions'
import { Navigate } from 'react-router-dom'
import { toast } from '@/lib/toast'

export function Locations() {
  const dispatch = useAppDispatch()
  const { locations, warehouses, isLoading } = useAppSelector((state) => state.warehouses)
  const user = useAppSelector((state) => state.auth.user)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  useEffect(() => {
    dispatch(fetchWarehouses())
    dispatch(fetchLocations())
  }, [dispatch])

  // Check if user can access settings
  if (!canAccessSettings(user)) {
    return <Navigate to="/dashboard" replace />
  }

  const canCreate = hasPermission(user, 'locations.create')
  const canEdit = hasPermission(user, 'locations.edit')
  const canDeleteLocations = canDelete(user, 'location')

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
    ...(canDeleteLocations ? [{
      key: 'actions',
      header: 'Actions',
      cell: (row: Location) => (
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
    setSelectedLocation(null)
    setIsFormOpen(true)
  }

  const handleEdit = (location: Location) => {
    if (canEdit) {
      setSelectedLocation(location)
      setIsFormOpen(true)
    }
  }

  const handleDelete = async (id: string) => {
    if (canDeleteLocations && window.confirm('Are you sure you want to delete this location?')) {
      try {
        await dispatch(deleteLocation(id)).unwrap()
        toast('Location deleted successfully', 'success')
      } catch (error) {
        toast('Failed to delete location', 'error')
      }
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">location</h1>
        </div>
        {canCreate && (
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Location
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={locations}
        isLoading={isLoading}
        emptyMessage="No locations found"
        onRowClick={canEdit ? handleEdit : undefined}
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
            try {
              if (selectedLocation) {
                await dispatch(updateLocation({ id: selectedLocation.id, data })).unwrap()
                toast('Location updated successfully', 'success')
              } else {
                await dispatch(createLocation(data)).unwrap()
                toast('Location created successfully', 'success')
              }
              setIsFormOpen(false)
              setSelectedLocation(null)
            } catch (error) {
              toast('Failed to save location', 'error')
            }
          }}
        />
      )}
    </div>
  )
}

