import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopNav from '../components/TopNav'

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <TopNav />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
