import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useToastStore } from '../../store/toastStore'
import { ToastContainer } from '../UI/Toast'

export default function AppLayout() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}
