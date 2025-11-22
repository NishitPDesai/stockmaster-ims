import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  Truck, 
  ArrowLeftRight, 
  FileText, 
  History, 
  Warehouse,
  MapPin,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useAppSelector } from '@/store/hooks'
import { canAccessSettings } from '@/lib/permissions'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Package, label: 'Products', path: '/products' },
  { icon: Receipt, label: 'Receipts', path: '/operations/receipts' },
  { icon: Truck, label: 'Deliveries', path: '/operations/deliveries' },
  { icon: ArrowLeftRight, label: 'Transfers', path: '/operations/transfers' },
  { icon: FileText, label: 'Adjustments', path: '/operations/adjustments' },
  { icon: History, label: 'Ledger', path: '/ledger' },
]

const settingsItems = [
  { icon: Warehouse, label: 'Warehouses', path: '/settings/warehouses' },
  { icon: MapPin, label: 'Locations', path: '/settings/locations' },
]

export function Sidebar() {
  const location = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const user = useAppSelector((state) => state.auth.user)
  const canAccessSettingsPage = canAccessSettings(user)

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

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

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-card border-r z-40 transition-transform duration-300",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full p-4">
          <div className="mb-8 px-4 py-2">
            <h1 className="text-2xl font-bold text-primary">StockMaster</h1>
            <p className="text-xs text-muted-foreground">Inventory Management</p>
          </div>

          <nav className="flex-1 space-y-2">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive(item.path)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                )
              })}
            </div>

            {canAccessSettingsPage && (
              <div className="pt-4 mt-4 border-t">
                <p className="px-4 text-xs font-semibold text-muted-foreground uppercase mb-2">
                  Settings
                </p>
                {settingsItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive(item.path)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            )}
          </nav>
        </div>
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

