import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useToastStore } from '../../store/toastStore'
import { ToastContainer } from '../UI/Toast'
import { Menu, X } from 'lucide-react'

export default function AppLayout() {
  const { toasts, removeToast } = useToastStore()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <div className={`fixed inset-0 z-40 bg-black/60 lg:hidden transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)} />

      <div className={`fixed top-0 left-0 h-full z-50 transition-transform lg:static lg:translate-x-0 lg:z-auto ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
          <button onClick={() => setOpen(true)} className="text-zinc-400 hover:text-zinc-100">
            <Menu size={20} />
          </button>
          <span className="font-semibold text-zinc-100 text-sm">Trading Bot</span>
        </div>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}
