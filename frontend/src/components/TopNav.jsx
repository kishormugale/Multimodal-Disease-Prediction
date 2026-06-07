import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function TopNav() {
  const { doctor, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 w-full px-6 py-3 h-16 bg-surface flex justify-between items-center z-40 border-b border-surface-container-high/50">
      <div className="flex items-center gap-4 flex-1">
        <h1 className="text-xl font-black text-primary font-headline tracking-tight hidden lg:block">
          KDM Care Hospital
        </h1>
        <div className="relative w-96 hidden md:block ml-4">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
            search
          </span>
          <input
            type="text"
            className="w-full bg-surface-container-high border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 font-body"
            placeholder="Search patient files, records or labs..."
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 text-slate-500 hover:bg-slate-200/50 rounded-full transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-2 text-slate-500 hover:bg-slate-200/50 rounded-full transition-colors">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <button className="p-2 text-slate-500 hover:bg-slate-200/50 rounded-full transition-colors">
          <span className="material-symbols-outlined">help</span>
        </button>
        <button
          onClick={handleLogout}
          title="Logout"
          className="p-2 text-slate-500 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
        <div className="h-8 w-[1px] bg-outline-variant mx-2"></div>
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-primary font-headline">{doctor.name.split(' ').slice(0, 2).join(' ')}</p>
            <p className="text-[10px] text-outline uppercase tracking-wider font-label">{doctor.specialization}</p>
          </div>
          <img
            alt="Doctor profile"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/10"
            src={doctor.avatar}
          />
        </div>
      </div>
    </header>
  )
}
