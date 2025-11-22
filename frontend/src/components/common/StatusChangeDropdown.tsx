import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { OperationStatus } from '@/types/Status'
import { ChevronDown, CheckCircle, XCircle, Clock, FileCheck } from 'lucide-react'
import { StatusBadge } from './StatusBadge'

interface StatusChangeDropdownProps {
  currentStatus: OperationStatus
  onStatusChange: (status: OperationStatus) => void
  canValidate?: boolean
  canComplete?: boolean
  canCancel?: boolean
  isManager?: boolean
}

const statusIcons = {
  [OperationStatus.READY]: FileCheck,
  [OperationStatus.DONE]: CheckCircle,
  [OperationStatus.CANCELED]: XCircle,
  [OperationStatus.WAITING]: Clock,
}

const statusLabels = {
  [OperationStatus.READY]: 'Validate',
  [OperationStatus.DONE]: 'Complete',
  [OperationStatus.CANCELED]: 'Cancel',
  [OperationStatus.WAITING]: 'Set Waiting',
}

export function StatusChangeDropdown({
  currentStatus,
  onStatusChange,
  canValidate = false,
  canComplete = false,
  canCancel = false,
  isManager = false,
}: StatusChangeDropdownProps) {
  const getAvailableActions = () => {
    const actions: Array<{ status: OperationStatus; label: string; icon: any }> = []

    if (currentStatus === OperationStatus.DRAFT && canValidate) {
      actions.push({
        status: OperationStatus.READY,
        label: statusLabels[OperationStatus.READY],
        icon: statusIcons[OperationStatus.READY],
      })
    }

    if (currentStatus === OperationStatus.READY && canComplete) {
      actions.push({
        status: OperationStatus.DONE,
        label: statusLabels[OperationStatus.DONE],
        icon: statusIcons[OperationStatus.DONE],
      })
    }

    if (
      currentStatus !== OperationStatus.DONE &&
      currentStatus !== OperationStatus.CANCELED &&
      canCancel &&
      isManager
    ) {
      actions.push({
        status: OperationStatus.CANCELED,
        label: statusLabels[OperationStatus.CANCELED],
        icon: statusIcons[OperationStatus.CANCELED],
      })
    }

    return actions
  }

  const availableActions = getAvailableActions()

  if (availableActions.length === 0) {
    return <StatusBadge status={currentStatus} />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <StatusBadge status={currentStatus} />
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableActions.map((action) => {
          const Icon = action.icon
          return (
            <DropdownMenuItem
              key={action.status}
              onClick={() => onStatusChange(action.status)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {action.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

