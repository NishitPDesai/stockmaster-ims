import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from './utils'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

let toastListeners: Array<(toasts: Toast[]) => void> = []
let toasts: Toast[] = []

function notify() {
  toastListeners.forEach((listener) => listener([...toasts]))
}

export function toast(message: string, type: ToastType = 'info', duration = 3000) {
  const id = Math.random().toString(36).substring(7)
  const newToast: Toast = { id, message, type, duration }
  toasts = [...toasts, newToast]
  notify()

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  return id
}

export function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id)
  notify()
}

export function useToast() {
  const [toastList, setToastList] = useState<Toast[]>([])

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setToastList(newToasts)
    }
    toastListeners.push(listener)
    listener(toasts)

    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener)
    }
  }, [])

  return { toasts: toastList, toast, removeToast }
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const styles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
}

export function ToastContainer() {
  const { toasts: toastList, removeToast } = useToast()

  if (toastList.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toastList.map((toast) => {
        const Icon = icons[toast.type]
        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-center gap-3 rounded-lg border p-4 shadow-lg min-w-[300px] max-w-[500px]',
              styles[toast.type]
            )}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 rounded p-1 hover:bg-black/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

