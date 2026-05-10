import { useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

export interface ToastData {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

const config = {
  success: { icon: CheckCircle, cls: 'bg-zinc-900 border-emerald-500/30 text-emerald-400' },
  error: { icon: XCircle, cls: 'bg-zinc-900 border-rose-500/30 text-rose-400' },
  warning: { icon: AlertTriangle, cls: 'bg-zinc-900 border-amber-500/30 text-amber-400' },
  info: { icon: Info, cls: 'bg-zinc-900 border-cyan-500/30 text-cyan-400' },
}

export function Toast({ toast, onClose }: { toast: ToastData; onClose: () => void }) {
  const { icon: Icon, cls } = config[toast.type]

  useEffect(() => {
    const t = setTimeout(onClose, 6000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${cls} shadow-2xl max-w-sm backdrop-blur-sm`}>
      <Icon size={18} className="mt-0.5 shrink-0" />
      <p className="text-sm text-zinc-200 flex-1">{toast.message}</p>
      <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 shrink-0">
        <X size={15} />
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onClose }: { toasts: ToastData[]; onClose: (id: string) => void }) {
  if (!toasts.length) return null
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onClose={() => onClose(t.id)} />
      ))}
    </div>
  )
}
