import { Operation } from '@/types'
import { OperationStatus } from '@/types/Status'
import { Card } from '@/components/ui/card'
import { StatusBadge } from './StatusBadge'
import { formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'

interface KanbanViewProps {
  operations: Operation[]
  onViewDetails: (operation: Operation) => void
  statusLabels: Record<OperationStatus, string>
}

export function KanbanView({ operations, onViewDetails, statusLabels }: KanbanViewProps) {
  const statuses: OperationStatus[] = [
    OperationStatus.DRAFT,
    OperationStatus.READY,
    OperationStatus.WAITING,
    OperationStatus.DONE,
    OperationStatus.CANCELED,
  ]

  const getOperationsByStatus = (status: OperationStatus) => {
    return operations.filter((op) => op.status === status)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statuses.map((status) => {
        const statusOps = getOperationsByStatus(status)
        return (
          <div key={status} className="flex-shrink-0 w-80">
            <div className="bg-muted rounded-lg p-3 mb-2">
              <h3 className="font-semibold text-sm">
                {statusLabels[status]} ({statusOps.length})
              </h3>
            </div>
            <div className="space-y-2">
              {statusOps.map((operation) => (
                <Card
                  key={operation.id}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onViewDetails(operation)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-medium text-primary">
                        {operation.documentNumber}
                      </span>
                      <StatusBadge status={operation.status} />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div>From: {operation.supplierName || operation.warehouseName || 'vendor'}</div>
                      <div>To: {operation.warehouseName || operation.customerName || '-'}</div>
                      {operation.scheduleDate && (
                        <div>Schedule: {formatDate(operation.scheduleDate)}</div>
                      )}
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onViewDetails(operation)
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {statusOps.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-8">
                  No operations
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

