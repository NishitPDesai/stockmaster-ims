import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Warehouse, CreateWarehouseDto } from '@/types'

const warehouseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
})

type WarehouseFormData = z.infer<typeof warehouseSchema>

interface WarehouseFormProps {
  warehouse: Warehouse | null
  onClose: () => void
  onSave: (data: CreateWarehouseDto) => Promise<void>
}

export function WarehouseForm({ warehouse, onClose, onSave }: WarehouseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: warehouse
      ? {
          name: warehouse.name,
          code: warehouse.code,
          address: warehouse.address,
          city: warehouse.city,
          country: warehouse.country,
        }
      : {
          name: '',
          code: '',
          address: '',
          city: '',
          country: '',
        },
  })

  const onSubmit = async (data: WarehouseFormData) => {
    await onSave(data)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Warehouse</DialogTitle>
          <DialogDescription className="sr-only">
            {warehouse ? 'Edit' : 'Create'} warehouse information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name:</Label>
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
            <Label htmlFor="code">Short Code:</Label>
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

          <div className="space-y-2">
            <Label htmlFor="address">Address:</Label>
            <Input id="address" {...register('address')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register('city')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" {...register('country')} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : warehouse ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

