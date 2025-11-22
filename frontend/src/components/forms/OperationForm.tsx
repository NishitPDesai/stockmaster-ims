import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DocumentType, CreateOperationDto } from '@/types'
import { Plus, Trash2 } from 'lucide-react'

const operationSchema = z.object({
  warehouseId: z.string().optional(),
  sourceWarehouseId: z.string().optional(),
  destinationWarehouseId: z.string().optional(),
  supplierId: z.string().optional(),
  customerId: z.string().optional(),
  lineItems: z.array(z.object({
    productId: z.string().min(1, 'Product is required'),
    quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
    uom: z.string().min(1, 'UOM is required'),
  })).min(1, 'At least one line item is required'),
  notes: z.string().optional(),
})

type OperationFormData = z.infer<typeof operationSchema>

interface OperationFormProps {
  documentType: DocumentType
  warehouses: Array<{ id: string; name: string }>
  onClose: () => void
  onSave: (data: CreateOperationDto) => Promise<void>
}

export function OperationForm({ documentType, warehouses, onClose, onSave }: OperationFormProps) {
  const [lineItems, setLineItems] = useState<Array<{ productId: string; quantity: number; uom: string }>>([
    { productId: '', quantity: 0, uom: '' },
  ])

  const {
    handleSubmit,
    formState: { isSubmitting },
    setValue,
    watch,
  } = useForm<OperationFormData>({
    resolver: zodResolver(operationSchema),
    defaultValues: {
      lineItems: [{ productId: '', quantity: 0, uom: '' }],
    },
  })

  const warehouseId = watch('warehouseId')
  const sourceWarehouseId = watch('sourceWarehouseId')
  const destinationWarehouseId = watch('destinationWarehouseId')

  const onSubmit = async (data: OperationFormData) => {
    await onSave({
      documentType,
      warehouseId: data.warehouseId,
      sourceWarehouseId: data.sourceWarehouseId,
      destinationWarehouseId: data.destinationWarehouseId,
      supplierId: data.supplierId,
      customerId: data.customerId,
      lineItems: lineItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        uom: item.uom,
      })),
      notes: data.notes,
    })
  }

  const addLineItem = () => {
    setLineItems([...lineItems, { productId: '', quantity: 0, uom: '' }])
  }

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const updateLineItem = (index: number, field: string, value: string | number) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }
    setLineItems(updated)
    setValue('lineItems', updated)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create {documentType}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {documentType === 'TRANSFER' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sourceWarehouse">Source Warehouse *</Label>
                <Select
                  value={sourceWarehouseId || ''}
                  onValueChange={(value) => setValue('sourceWarehouseId', value)}
                >
                  <SelectTrigger id="sourceWarehouse">
                    <SelectValue placeholder="Select source warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((wh) => (
                      <SelectItem key={wh.id} value={wh.id}>
                        {wh.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="destinationWarehouse">Destination Warehouse *</Label>
                <Select
                  value={destinationWarehouseId || ''}
                  onValueChange={(value) => setValue('destinationWarehouseId', value)}
                >
                  <SelectTrigger id="destinationWarehouse">
                    <SelectValue placeholder="Select destination warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((wh) => (
                      <SelectItem key={wh.id} value={wh.id}>
                        {wh.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="warehouse">Warehouse *</Label>
              <Select
                value={warehouseId || ''}
                onValueChange={(value) => setValue('warehouseId', value)}
              >
                <SelectTrigger id="warehouse">
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
            </div>
          )}

          <div className="space-y-2">
            <Label>Line Items</Label>
            <div className="space-y-2">
              {lineItems.map((item, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label>Product ID</Label>
                    <Input
                      value={item.productId}
                      onChange={(e) => updateLineItem(index, 'productId', e.target.value)}
                      placeholder="Product ID"
                    />
                  </div>
                  <div className="w-24">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      placeholder="Qty"
                    />
                  </div>
                  <div className="w-24">
                    <Label>UOM</Label>
                    <Input
                      value={item.uom}
                      onChange={(e) => updateLineItem(index, 'uom', e.target.value)}
                      placeholder="UOM"
                    />
                  </div>
                  {lineItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLineItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addLineItem} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Line Item
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" {...{ onChange: (e) => setValue('notes', e.target.value) }} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

