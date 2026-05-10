import { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from './Components'

interface ModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  children: ReactNode
  confirmLabel?: string
  confirmVariant?: 'primary' | 'danger' | 'warning'
  loading?: boolean
}

export function Modal({ open, onClose, onConfirm, title, children, confirmLabel = 'Confirmer', confirmVariant = 'primary', loading }: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h3 className="font-semibold text-zinc-100">{title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">
          {children}
        </div>
        <div className="flex justify-end gap-3 px-5 py-4 border-t border-zinc-800">
          <Button onClick={onClose} variant="ghost" size="sm">Annuler</Button>
          <Button onClick={onConfirm} variant={confirmVariant} size="sm" disabled={loading}>
            {loading ? 'En cours...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
