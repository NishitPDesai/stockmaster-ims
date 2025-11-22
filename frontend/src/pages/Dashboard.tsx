import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { fetchProducts } from '@/store/slices/productSlice'
import { fetchOperations } from '@/store/slices/operationSlice'
import { KPICard } from '@/components/common/KPICard'
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

  const totalProducts = (products || []).length
  const lowStockProducts = (products || []).filter(
    (p) => Object.values(p.stockPerWarehouse || {}).some((qty) => qty < 10)
  ).length

  const pendingReceipts = (operations || []).filter(
    (o) => o.documentType === DocumentType.RECEIPT && o.status !== OperationStatus.DONE
  ).length

  const pendingDeliveries = (operations || []).filter(
    (o) => o.documentType === DocumentType.DELIVERY && o.status !== OperationStatus.DONE
  ).length

  const scheduledTransfers = (operations || []).filter(
    (o) => o.documentType === DocumentType.TRANSFER && o.status === OperationStatus.WAITING
  ).length

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your inventory management</p>
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
          value={pendingReceipts}
          icon={Receipt}
        />
        <KPICard
          title="Pending Deliveries"
          value={pendingDeliveries}
          icon={Truck}
        />
        <KPICard
          title="Scheduled Transfers"
          value={scheduledTransfers}
          icon={ArrowLeftRight}
        />
      </div>
    </div>
  )
}

