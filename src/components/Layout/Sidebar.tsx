import { Link, useLocation } from 'react-router-dom'
import { useStore } from '../../store'
import { LayoutDashboard, TrendingUp, BarChart3, History, Bot, LogOut, Cpu, Settings, Search, CalendarDays, X } from 'lucide-react'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/bot', label: 'Bot', icon: Cpu },
  { to: '/trading', label: 'Trading', icon: TrendingUp },
  { to: '/strategies', label: 'Strategies', icon: Bot },
  { to: '/backtest', label: 'Backtest', icon: BarChart3 },
  { to: '/optimizer', label: 'Optimiseur', icon: Search },
  { to: '/calendar', label: 'Calendrier', icon: CalendarDays },
  { to: '/history', label: 'Historique', icon: History },
  { to: '/settings', label: 'Parametres', icon: Settings },
]

interface SidebarProps {
  onClose?: () => void
}

export default function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation()
  const logout = useStore((s) => s.logout)
  const user = useStore((s) => s.user)

  return (
    <div className="w-60 bg-zinc-900 border-r border-zinc-800 h-full flex flex-col">
      <div className="p-4 flex items-center justify-between mb-2">
        <div>
          <h1 className="text-base font-bold text-cyan-400 tracking-tight">Trading Bot</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Paper Trading</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-zinc-500 hover:text-zinc-300">
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon
          const active = location.pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
              }`}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-zinc-800 p-4 mt-2">
        <p className="text-zinc-500 text-xs mb-3 truncate">{user?.email}</p>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-zinc-500 hover:text-rose-400 text-sm px-2 py-1.5 w-full rounded-lg hover:bg-zinc-800 transition-all"
        >
          <LogOut size={16} />
          Deconnexion
        </button>
      </div>
    </div>
  )
}
