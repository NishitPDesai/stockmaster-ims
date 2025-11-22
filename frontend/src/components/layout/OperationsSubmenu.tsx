import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Receipt, Truck, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'

const operationsItems = [
  { icon: Receipt, label: 'Receipt', path: '/operations/receipts' },
  { icon: Truck, label: 'Delivery', path: '/operations/deliveries' },
  { icon: FileText, label: 'Adjustment', path: '/operations/adjustments' },
]

export function OperationsSubmenu() {
  const location = useLocation()
  const navigate = useNavigate()
  const isOperationsActive = location.pathname.startsWith('/operations/')
  
  // Get current active operation label
  const currentOperation = operationsItems.find(
    item => location.pathname === item.path || location.pathname.startsWith(item.path + '/')
  )

  const handleOperationsClick = () => {
    // If not on any operations page, navigate to Receipts (default)
    if (!isOperationsActive) {
      navigate('/operations/receipts')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          onClick={handleOperationsClick}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2 h-12 rounded-none",
            isOperationsActive
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
          )}
        >
          <Receipt className="h-4 w-4" />
          Operations
          {currentOperation && (
            <span className="text-xs text-muted-foreground ml-1">
              ({currentOperation.label})
            </span>
          )}
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {operationsItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
          return (
            <DropdownMenuItem key={item.path} asChild>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-2 cursor-pointer",
                  isActive && "bg-accent font-medium"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

