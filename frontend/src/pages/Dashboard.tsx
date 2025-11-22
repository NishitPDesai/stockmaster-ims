import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { fetchProducts } from '@/store/slices/productSlice'
import { fetchOperations } from '@/store/slices/operationSlice'
import { KPICard } from '@/components/common/KPICard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, AlertTriangle, Receipt, Truck, ArrowLeftRight } from 'lucide-react'
import { OperationStatus, DocumentType } from '@/types/Status'

export function Dashboard() {
  const dispatch = useAppDispatch()
  const { items: products } = useAppSelector((state) => state.products)
  const { items: operations } = useAppSelector((state) => state.operations)

  useEffect(() => {
    dispatch(fetchProducts())
    dispatch(fetchOperations())
  }, [dispatch])

  const today = new Date().toISOString().split('T')[0]
  
  const totalProducts = (products || []).length
  const lowStockProducts = (products || []).filter(
    (p) => Object.values(p.stockPerWarehouse || {}).some((qty) => qty < 10)
  ).length

  // Receipts calculations
  const allReceipts = (operations || []).filter((o) => o.documentType === DocumentType.RECEIPT)
  const receiptsToReceive = allReceipts.filter((o) => o.status === OperationStatus.READY).length
  const lateReceipts = allReceipts.filter((o) => {
    if (!o.scheduleDate) return false
    return o.scheduleDate < today && o.status !== OperationStatus.DONE && o.status !== OperationStatus.CANCELED
  }).length
  const receiptOperations = allReceipts.filter((o) => {
    if (!o.scheduleDate) return false
    return o.scheduleDate > today
  }).length

  // Deliveries calculations
  const allDeliveries = (operations || []).filter((o) => o.documentType === DocumentType.DELIVERY)
  const deliveriesToDeliver = allDeliveries.filter((o) => o.status === OperationStatus.READY).length
  const lateDeliveries = allDeliveries.filter((o) => {
    if (!o.scheduleDate) return false
    return o.scheduleDate < today && o.status !== OperationStatus.DONE && o.status !== OperationStatus.CANCELED
  }).length
  const waitingDeliveries = allDeliveries.filter((o) => o.status === OperationStatus.WAITING).length
  const deliveryOperations = allDeliveries.filter((o) => {
    if (!o.scheduleDate) return false
    return o.scheduleDate > today
  }).length

  const scheduledTransfers = (operations || []).filter(
    (o) => o.documentType === DocumentType.TRANSFER && o.status === OperationStatus.WAITING
  ).length

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KPICard
          title="Total Products"
          value={totalProducts}
          icon={Package}
        />
        <KPICard
          title="Low Stock Items"
          value={lowStockProducts}
          icon={AlertTriangle}
          trend={lowStockProducts > 0 ? { value: 0, isPositive: false } : undefined}
        />
        <KPICard
          title="Pending Receipts"
          value={receiptsToReceive}
          icon={Receipt}
        />
        <KPICard
          title="Pending Deliveries"
          value={deliveriesToDeliver}
          icon={Truck}
        />
        <KPICard
          title="Scheduled Transfers"
          value={scheduledTransfers}
          icon={ArrowLeftRight}
        />
      </div>

      {/* Receipts and Deliveries Status Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Receipt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{receiptsToReceive} to receive</div>
            {lateReceipts > 0 && (
              <div className="text-sm text-destructive">{lateReceipts} Late</div>
            )}
            <div className="text-sm text-muted-foreground">{receiptOperations} operations</div>
            {receiptOperations === 0 && lateReceipts === 0 && receiptsToReceive === 0 && (
              <div className="text-sm text-muted-foreground">No active operations</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Delivery
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{deliveriesToDeliver} to Deliver</div>
            {lateDeliveries > 0 && (
              <div className="text-sm text-destructive">{lateDeliveries} Late</div>
            )}
            {waitingDeliveries > 0 && (
              <div className="text-sm text-yellow-600">{waitingDeliveries} waiting</div>
            )}
            <div className="text-sm text-muted-foreground">{deliveryOperations} operations</div>
            {deliveryOperations === 0 && lateDeliveries === 0 && waitingDeliveries === 0 && deliveriesToDeliver === 0 && (
              <div className="text-sm text-muted-foreground">No active operations</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Definitions */}
      <Card>
        <CardHeader>
          <CardTitle>Status Definitions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>Late:</strong> schedule date &lt; today's date</div>
            <div><strong>Operations:</strong> schedule date &gt; today's date</div>
            <div><strong>Waiting:</strong> Waiting for the stocks</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

