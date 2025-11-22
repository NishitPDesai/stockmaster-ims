import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Warehouse, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { useAppSelector } from '@/store/hooks'
import { canAccessSettings } from '@/lib/permissions'

const settingsItems = [
  { icon: Warehouse, label: 'Warehouse', path: '/settings/warehouses' },
  { icon: MapPin, label: 'location', path: '/settings/locations' },
]

export function SettingsSubmenu() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const isSettingsActive = location.pathname.startsWith('/settings/')
  
  // Only show Settings menu if user has access
  if (!canAccessSettings(user)) {
    return null
  }
  
  // Get current active setting label
  const currentSetting = settingsItems.find(
    item => location.pathname === item.path || location.pathname.startsWith(item.path + '/')
  )

  const handleSettingsClick = () => {
    // If not on any settings page, navigate to Warehouses (default)
    if (!isSettingsActive) {
      navigate('/settings/warehouses')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          onClick={handleSettingsClick}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2 h-12 rounded-none",
            isSettingsActive
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
          )}
        >
          <Warehouse className="h-4 w-4" />
          Settings
          {currentSetting && (
            <span className="text-xs text-muted-foreground ml-1">
              ({currentSetting.label})
            </span>
          )}
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {settingsItems.map((item) => {
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

