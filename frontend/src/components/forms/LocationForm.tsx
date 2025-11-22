import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Location, CreateLocationDto } from '@/types'

const locationSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse is required'),
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional(),
})

type LocationFormData = z.infer<typeof locationSchema>

interface LocationFormProps {
  location: Location | null
  warehouses: Array<{ id: string; name: string }>
  onClose: () => void
  onSave: (data: CreateLocationDto) => Promise<void>
}

export function LocationForm({ location, warehouses, onClose, onSave }: LocationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: location
      ? {
          warehouseId: location.warehouseId,
          name: location.name,
          code: location.code,
          description: location.description,
        }
      : {
          warehouseId: '',
          name: '',
          code: '',
          description: '',
        },
  })

  const warehouseId = watch('warehouseId')

  const onSubmit = async (data: LocationFormData) => {
    await onSave(data)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{location ? 'Edit Location' : 'Create Location'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="warehouseId">Warehouse *</Label>
            <Select
              value={warehouseId}
              onValueChange={(value) => setValue('warehouseId', value)}
            >
              <SelectTrigger id="warehouseId">
                <SelectValue placeholder="Select warehouse" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((wh) => (
                  <SelectItem key={wh.id} value={wh.id}>
                    {wh.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.warehouseId && (
              <p className="text-sm text-red-600" role="alert">
                {errors.warehouseId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register('name')}
                aria-invalid={errors.name ? 'true' : 'false'}
              />
              {errors.name && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                {...register('code')}
                aria-invalid={errors.code ? 'true' : 'false'}
              />
              {errors.code && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.code.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register('description')} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : location ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

