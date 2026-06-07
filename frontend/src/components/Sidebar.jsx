import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { path: '/', icon: 'dashboard', label: 'Dashboard', end: true },
  { path: '/patients', icon: 'group', label: 'Patients' },
  { path: '/predict', icon: 'psychology', label: 'Predict' },
  { path: '/reports', icon: 'analytics', label: 'Reports' },
  { path: '/profile', icon: 'account_circle', label: 'Profile' },
]

export default function Sidebar() {
  const { logout } = useAuth()
  const location = useLocation()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low flex flex-col pt-4 pb-8 z-50">
      {/* Hospital Branding */}
      <div className="px-6 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              clinical_notes
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight font-headline">KDM Care</h2>
            <p className="text-[10px] uppercase tracking-wider text-outline font-label">Precision Care Unit</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map(item => {
          const isActive = item.end
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path)

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={`flex items-center gap-3 px-4 py-3 rounded-l-xl transition-all duration-200 text-sm font-medium font-body ${
                isActive
                  ? 'bg-white text-primary shadow-sm translate-x-1'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-4 mt-auto">
        <button className="w-full py-3 px-4 bg-tertiary-container text-on-tertiary rounded-xl flex items-center justify-center gap-2 font-bold font-headline mb-6 hover:opacity-90 transition-opacity shadow-lg shadow-tertiary/20">
          <span className="material-symbols-outlined text-sm">emergency</span>
          <span>Emergency Alert</span>
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-white/50 rounded-xl transition-colors w-full"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-medium text-sm font-body">Logout</span>
        </button>
      </div>
    </aside>
  )
}
