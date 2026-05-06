// src/components/Layout/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom'
import { useStore } from '../../store'
import { LayoutDashboard, TrendingUp, BarChart3, History, Bot, LogOut, Cpu, Settings, Search, CalendarDays } from 'lucide-react'

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

export default function Sidebar() {
  const location = useLocation()
  const logout = useStore((s) => s.logout)
  const user = useStore((s) => s.user)

  return (
    <div className="w-64 bg-gray-900 min-h-screen p-4 flex flex-col">
      <h1 className="text-xl font-bold mb-8 text-center">Trading Bot</h1>
      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          const Icon = link.icon
          const active = location.pathname === link.to
          return (
            <Link
              key={link.to} to={link.to}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              {link.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-gray-800 pt-4">
        <p className="text-gray-500 text-sm mb-2">{user?.username}</p>
        <button onClick={logout} className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm">
          <LogOut size={16} /> Deconnexion
        </button>
      </div>
    </div>
  )
}
