import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  History,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useAppSelector } from '@/store/hooks'
import { OperationsSubmenu } from './OperationsSubmenu'
import { SettingsSubmenu } from './SettingsSubmenu'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Package, label: 'Products', path: '/products' },
  { icon: History, label: 'Move History', path: '/ledger' },
]

export function Sidebar() {
  const location = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const user = useAppSelector((state) => state.auth.user)

  const isActive = (path: string) => {
    if (path === '/operations/receipts') {
      return location.pathname.startsWith('/operations/')
    }
    if (path === '/settings/warehouses') {
      return location.pathname.startsWith('/settings/')
    }
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-background border shadow-sm"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar - Horizontal Navigation Tabs */}
      <aside
        className={cn(
          "fixed left-0 top-14 w-full bg-card border-b z-40 transition-transform duration-300",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <nav className="flex items-center gap-1 px-4 lg:px-6 h-12 overflow-x-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isItemActive = isActive(item.path)
            const active = isItemActive
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2 h-12",
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
          {/* Operations submenu */}
          <OperationsSubmenu />
          {/* Settings submenu */}
          <SettingsSubmenu />
        </nav>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}

