import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DocumentType, CreateOperationDto, Operation, Product } from '@/types'
import { Plus, Trash2, FileCheck, CheckCircle, XCircle, Printer } from 'lucide-react'
import { useAppSelector } from '@/store/hooks'
import { formatDate } from '@/lib/format'
import { OperationStatus } from '@/types/Status'
import { hasPermission } from '@/lib/permissions'

const operationSchema = z.object({
  warehouseId: z.string().optional(),
  sourceWarehouseId: z.string().optional(),
  destinationWarehouseId: z.string().optional(),
  supplierId: z.string().optional(),
  customerId: z.string().optional(),
  responsible: z.string().optional(),
  scheduleDate: z.string().optional(),
  deliveryAddress: z.string().optional(),
  lineItems: z.array(z.object({
    productId: z.string().min(1, 'Product is required'),
    quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
    uom: z.string().min(1, 'UOM is required'),
  })).min(1, 'At least one line item is required'),
  notes: z.string().optional(),
});

type OperationFormData = z.infer<typeof operationSchema>;

interface OperationFormProps {
  documentType: DocumentType
  warehouses: Array<{ id: string; name: string }>
  operation?: Operation | null
  onClose: () => void
  onSave: (data: CreateOperationDto | (CreateOperationDto & { status?: OperationStatus })) => Promise<void>
}

export function OperationForm({ documentType, warehouses, operation, onClose, onSave }: OperationFormProps) {
  const { items: products } = useAppSelector((state) => state.products)
  const user = useAppSelector((state) => state.auth.user)
  const [lineItems, setLineItems] = useState<Array<{ productId: string; quantity: number; uom: string }>>(
    operation?.lineItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      uom: item.uom,
    })) || [{ productId: "", quantity: 0, uom: "" }]
  );

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    watch,
  } = useForm<OperationFormData>({
    resolver: zodResolver(operationSchema),
    defaultValues: {
      lineItems: [{ productId: "", quantity: 0, uom: "" }],
    },
  });

  const warehouseId = watch("warehouseId");
  const sourceWarehouseId = watch("sourceWarehouseId");
  const destinationWarehouseId = watch("destinationWarehouseId");

  useEffect(() => {
    if (operation) {
      setValue('warehouseId', operation.warehouseId || '')
      setValue('sourceWarehouseId', operation.sourceWarehouseId || '')
      setValue('destinationWarehouseId', operation.destinationWarehouseId || '')
      setValue('supplierId', operation.supplierId || '')
      setValue('customerId', operation.customerId || '')
      setValue('responsible', operation.responsible || user?.id || '')
      setValue('scheduleDate', operation.scheduleDate || '')
      setValue('deliveryAddress', operation.deliveryAddress || '')
      setValue('notes', operation.notes || '')
    } else {
      // Auto-fill responsible with current user
      setValue('responsible', user?.id || '')
    }
  }, [operation, setValue, user])

  const getProductStock = (productId: string, warehouseId?: string): number => {
    const product = products.find((p) => p.id === productId);
    if (!product) return 0;

    // Sum all stock including virtual __initial__ warehouse
    const totalStock = Object.values(product.stockPerWarehouse || {}).reduce(
      (sum, qty) => sum + qty,
      0
    );

    if (warehouseId) {
      const warehouseStock = product.stockPerWarehouse?.[warehouseId] || 0;
      // If no stock in specific warehouse but has initial stock, show total
      return warehouseStock > 0 ? warehouseStock : totalStock;
    }

    return totalStock;
  };

  const onSubmit = async (data: OperationFormData) => {
    await onSave({
      documentType,
      warehouseId: data.warehouseId,
      sourceWarehouseId: data.sourceWarehouseId,
      destinationWarehouseId: data.destinationWarehouseId,
      supplierId: data.supplierId,
      customerId: data.customerId,
      responsible: data.responsible || user?.id,
      scheduleDate: data.scheduleDate,
      deliveryAddress: data.deliveryAddress,
      lineItems: lineItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        uom: item.uom,
      })),
      notes: data.notes,
    })
  }

  const addLineItem = () => {
    setLineItems([...lineItems, { productId: "", quantity: 0, uom: "" }]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setLineItems((prevItems) => {
      const updated = [...prevItems];
      updated[index] = { ...updated[index], [field]: value };
      setValue("lineItems", updated);
      return updated;
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{operation ? 'Edit' : 'New'} {documentType === 'RECEIPT' ? 'Receipt' : documentType === 'DELIVERY' ? 'Delivery' : documentType === 'TRANSFER' ? 'Transfer' : 'Adjustment'}</DialogTitle>
          <DialogDescription className="sr-only">
            {operation ? 'Edit' : 'Create'} operation form
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Status Flow Indicator */}
          {operation && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground pb-2 border-b">
              <span className={operation.status === OperationStatus.DRAFT ? 'font-semibold text-foreground' : ''}>Draft</span>
              <span>→</span>
              <span className={operation.status === OperationStatus.READY ? 'font-semibold text-foreground' : ''}>Ready</span>
              <span>→</span>
              <span className={operation.status === OperationStatus.DONE ? 'font-semibold text-foreground' : ''}>Done</span>
            </div>
          )}
          {/* Document Number Display */}
          {operation && (
            <div className="space-y-2">
              <Label>Reference</Label>
              <Input value={operation.documentNumber} readOnly className="font-mono" />
            </div>
          )}

          {/* Warehouse Selection */}
          {documentType === 'TRANSFER' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sourceWarehouse">Source Warehouse *</Label>
                <Select
                  value={sourceWarehouseId || ""}
                  onValueChange={(value) =>
                    setValue("sourceWarehouseId", value)
                  }
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
                <Label htmlFor="destinationWarehouse">
                  Destination Warehouse *
                </Label>
                <Select
                  value={destinationWarehouseId || ""}
                  onValueChange={(value) =>
                    setValue("destinationWarehouseId", value)
                  }
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
                value={warehouseId || ""}
                onValueChange={(value) => setValue("warehouseId", value)}
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

          {/* Receive From / Delivery Address */}
          {documentType === 'RECEIPT' && (
            <div className="space-y-2">
              <Label htmlFor="supplierId">Receive From</Label>
              <Input
                id="supplierId"
                value={watch('supplierId') || ''}
                onChange={(e) => setValue('supplierId', e.target.value)}
                placeholder="Enter supplier/vendor name"
              />
            </div>
          )}

          {documentType === 'DELIVERY' && (
            <div className="space-y-2">
              <Label htmlFor="deliveryAddress">Delivery Address</Label>
              <Input
                id="deliveryAddress"
                value={watch('deliveryAddress') || ''}
                onChange={(e) => setValue('deliveryAddress', e.target.value)}
                placeholder="Enter delivery address"
              />
            </div>
          )}

          {/* Responsible (Auto-filled) */}
          <div className="space-y-2">
            <Label htmlFor="responsible">Responsible</Label>
            <Input
              id="responsible"
              value={user?.name || ''}
              readOnly
              className="bg-muted"
            />
          </div>

          {/* Schedule Date */}
          <div className="space-y-2">
            <Label htmlFor="scheduleDate">Schedule Date</Label>
            <Input
              id="scheduleDate"
              type="date"
              value={watch('scheduleDate') || ''}
              onChange={(e) => setValue('scheduleDate', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Line Items</Label>
            <div className="space-y-2">
              {lineItems.map((item, index) => {
                const selectedProduct = products.find(
                  (p) => p.id === item.productId
                );
                const currentWarehouseId =
                  documentType === "TRANSFER" ? sourceWarehouseId : warehouseId;
                const stock = selectedProduct
                  ? getProductStock(item.productId, currentWarehouseId)
                  : 0;

                return (
                  <div
                    key={index}
                    className="flex gap-2 items-end border rounded-lg p-3"
                  >
                    <div className="flex-1">
                      <Label>Product *</Label>
                      <Select
                        key={item.productId || `empty-${index}`}
                        value={item.productId || ""}
                        onValueChange={(value) => {
                          const product = products.find((p) => p.id === value);
                          updateLineItem(index, "productId", value);
                          if (product) {
                            updateLineItem(index, "uom", product.uom);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} ({product.sku}) - Stock:{" "}
                              {getProductStock(product.id, currentWarehouseId)}{" "}
                              {product.uom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedProduct && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Available: {stock} {selectedProduct.uom}
                        </p>
                      )}
                    </div>
                    <div className="w-32">
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantity || ""}
                        onChange={(e) =>
                          updateLineItem(
                            index,
                            "quantity",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="Qty"
                      />
                    </div>
                    <div className="w-32">
                      <Label>UOM *</Label>
                      <Input
                        value={item.uom}
                        onChange={(e) =>
                          updateLineItem(index, "uom", e.target.value)
                        }
                        placeholder="UOM"
                        readOnly={!!selectedProduct}
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
                );
              })}
              <Button
                type="button"
                variant="outline"
                onClick={addLineItem}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Line Item
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={watch('notes') || ''}
              onChange={(e) => setValue("notes", e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              {operation && (
                <>
                  {operation.status === OperationStatus.DRAFT && hasPermission(user, 'operations.validate') && (
                    <Button
                      type="button"
                      variant="default"
                      onClick={async () => {
                        await onSave({
                          documentType,
                          status: OperationStatus.READY,
                          warehouseId: watch('warehouseId'),
                          sourceWarehouseId: watch('sourceWarehouseId'),
                          destinationWarehouseId: watch('destinationWarehouseId'),
                          supplierId: watch('supplierId'),
                          customerId: watch('customerId'),
                          responsible: watch('responsible'),
                          scheduleDate: watch('scheduleDate'),
                          deliveryAddress: watch('deliveryAddress'),
                          lineItems: lineItems.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            uom: item.uom,
                          })),
                          notes: watch('notes'),
                        })
                      }}
                    >
                      <FileCheck className="mr-2 h-4 w-4" />
                      Validate
                    </Button>
                  )}
                  {operation.status === OperationStatus.READY && hasPermission(user, 'operations.complete') && (
                    <Button
                      type="button"
                      variant="default"
                      onClick={async () => {
                        await onSave({
                          documentType,
                          status: OperationStatus.DONE,
                          warehouseId: watch('warehouseId'),
                          sourceWarehouseId: watch('sourceWarehouseId'),
                          destinationWarehouseId: watch('destinationWarehouseId'),
                          supplierId: watch('supplierId'),
                          customerId: watch('customerId'),
                          responsible: watch('responsible'),
                          scheduleDate: watch('scheduleDate'),
                          deliveryAddress: watch('deliveryAddress'),
                          lineItems: lineItems.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            uom: item.uom,
                          })),
                          notes: watch('notes'),
                        })
                      }}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete
                    </Button>
                  )}
                  {operation.status === OperationStatus.DONE && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => window.print()}
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </Button>
                  )}
                  {operation.status !== OperationStatus.DONE && operation.status !== OperationStatus.CANCELED && hasPermission(user, 'operations.cancel') && user?.role === 'manager' && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={async () => {
                        await onSave({
                          documentType,
                          status: OperationStatus.CANCELED,
                          warehouseId: watch('warehouseId'),
                          sourceWarehouseId: watch('sourceWarehouseId'),
                          destinationWarehouseId: watch('destinationWarehouseId'),
                          supplierId: watch('supplierId'),
                          customerId: watch('customerId'),
                          responsible: watch('responsible'),
                          scheduleDate: watch('scheduleDate'),
                          deliveryAddress: watch('deliveryAddress'),
                          lineItems: lineItems.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            uom: item.uom,
                          })),
                          notes: watch('notes'),
                        })
                      }}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  )}
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Close
              </Button>
              {(!operation || operation.status === OperationStatus.DRAFT) && (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (operation ? 'Updating...' : 'Creating...') : (operation ? 'Update' : 'Create')}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}