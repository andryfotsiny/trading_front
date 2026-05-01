// src/components/UI/Toast.tsx
import { useEffect } from 'react'
import { AlertTriangle, CheckCircle, XCircle, Info, X } from 'lucide-react'

export interface ToastData {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const colors = {
  success: 'bg-green-900 border-green-600 text-green-200',
  error: 'bg-red-900 border-red-600 text-red-200',
  warning: 'bg-yellow-900 border-yellow-600 text-yellow-200',
  info: 'bg-blue-900 border-blue-600 text-blue-200',
}

export function Toast({ toast, onClose }: { toast: ToastData; onClose: () => void }) {
  const Icon = icons[toast.type]

  useEffect(() => {
    const timer = setTimeout(onClose, 8000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${colors[toast.type]} shadow-lg max-w-md animate-slide-in`}>
      <Icon size={20} className="mt-0.5 shrink-0" />
      <p className="text-sm flex-1">{toast.message}</p>
      <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onClose }: { toasts: ToastData[]; onClose: (id: string) => void }) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onClose={() => onClose(t.id)} />
      ))}
    </div>
  )
}
