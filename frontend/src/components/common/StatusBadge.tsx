import { OperationStatus, StatusLabels } from '@/types/Status'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: OperationStatus
  className?: string
}

const statusColors: Record<OperationStatus, string> = {
  [OperationStatus.DRAFT]: 'bg-gray-100 text-gray-800 border-gray-300',
  [OperationStatus.WAITING]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  [OperationStatus.READY]: 'bg-blue-100 text-blue-800 border-blue-300',
  [OperationStatus.DONE]: 'bg-green-100 text-green-800 border-green-300',
  [OperationStatus.CANCELED]: 'bg-red-100 text-red-800 border-red-300',
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        statusColors[status],
        className
      )}
    >
      {StatusLabels[status]}
    </span>
  )
}

