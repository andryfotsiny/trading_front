import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="text-center">
        <p className="text-8xl font-bold text-zinc-800 mb-4">404</p>
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">Page introuvable</h1>
        <p className="text-zinc-500 text-sm mb-8">Cette page n'existe pas ou a été déplacée.</p>
        <Link
          to="/"
          className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Retour au dashboard
        </Link>
      </div>
    </div>
  )
}
