import { Link, Outlet, useLocation } from 'react-router-dom'
import { useUser } from '../context/UserContext'

const Layout = () => {
  const location = useLocation()
  const { user, logout } = useUser()
  
  const navItems = [
    { path: '/solved', label: '✓ Solved', icon: '✔️' },
    { path: '/search', label: '🔍 Search', icon: '🔎' },
    { path: '/buckets', label: '📦 Buckets', icon: '📦' },
  ]

  const isActive = (path) => location.pathname === path || (path === '/solved' && location.pathname === '/')

  return (
    <div className="flex h-screen bg-zinc-950">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-zinc-900 border-r border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-2xl font-bold text-blue-500 mb-1">CF Forge</h1>
          <p className="text-xs text-zinc-500">@{user?.handle}</p>
        </div>
        
        <nav className="flex-1 p-4">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-3 mb-2 rounded-lg transition ${
                isActive(item.path)
                  ? 'bg-blue-500 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              <span className="text-lg mr-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={logout}
            className="w-full px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar - Mobile Nav */}
        <div className="md:hidden border-b border-zinc-800 bg-zinc-900 flex items-center justify-between p-4">
          <div className="flex-1">
            <h1 className="text-lg font-bold text-blue-500">CF Forge</h1>
            <p className="text-xs text-zinc-500">@{user?.handle}</p>
          </div>
          <div className="flex gap-2">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-2xl transition ${
                  isActive(item.path) ? 'text-blue-500' : 'text-zinc-400'
                }`}
              >
                {item.icon}
              </Link>
            ))}
            <button
              onClick={logout}
              className="text-2xl text-zinc-400 hover:text-zinc-200"
            >
              🚪
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Layout
