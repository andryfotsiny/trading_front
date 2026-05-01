// src/components/UI/Alert.tsx
import { useEffect } from 'react'
import { AlertTriangle, X, WifiOff, KeyRound } from 'lucide-react'

interface AlertProps {
  message: string
  type: 'timeout' | 'auth' | 'network' | 'error'
  onClose: () => void
}

const ICONS = {
  timeout: AlertTriangle,
  auth: KeyRound,
  network: WifiOff,
  error: AlertTriangle,
}

const COLORS = {
  timeout: 'bg-yellow-900 border-yellow-600 text-yellow-200',
  auth: 'bg-red-900 border-red-600 text-red-200',
  network: 'bg-orange-900 border-orange-600 text-orange-200',
  error: 'bg-red-900 border-red-600 text-red-200',
}

export default function Alert({ message, type, onClose }: AlertProps) {
  const Icon = ICONS[type] || AlertTriangle
  const color = COLORS[type] || COLORS.error

  useEffect(() => {
    const timer = setTimeout(onClose, 8000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-xl border ${color} shadow-2xl animate-slide-in`}>
      <div className="flex items-start gap-3">
        <Icon size={22} className="mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-sm">{message}</p>
        </div>
        <button onClick={onClose} className="flex-shrink-0 opacity-60 hover:opacity-100">
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
