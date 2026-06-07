import { useAuth } from '../context/AuthContext'
import { weeklyChartData, recentActivity, initialReports, initialPatients } from '../data/mockData'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Link } from 'react-router-dom'

function StatsCard({ label, value, icon, iconFill, trend, trendIcon, trendColor, bgIcon }) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group animate-fade-in-up">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold text-outline uppercase tracking-widest mb-1 font-label">{label}</p>
          <h3 className="text-4xl font-black text-on-surface font-headline">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-full ${bgIcon} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <span className="material-symbols-outlined" style={iconFill ? { fontVariationSettings: "'FILL' 1" } : undefined}>
            {icon}
          </span>
        </div>
      </div>
      <div className={`mt-4 flex items-center gap-2 text-xs font-medium ${trendColor}`}>
        <span className="material-symbols-outlined text-sm">{trendIcon}</span>
        <span>{trend}</span>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { doctor } = useAuth()

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-black text-primary font-headline tracking-tight">
            Welcome, {doctor.name.split(' ').slice(0, 2).join(' ')}
          </h1>
          <p className="text-on-surface-variant mt-1 font-body">
            You have 12 critical updates pending for today's clinical rounds.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-surface-container-highest text-primary font-bold rounded-xl flex items-center gap-2 hover:bg-white transition-colors font-headline">
            <span className="material-symbols-outlined">calendar_today</span>
            <span>Schedule</span>
          </button>
          <Link
            to="/patients"
            className="px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl transition-shadow font-headline"
          >
            <span className="material-symbols-outlined">add</span>
            <span>New Patient</span>
          </Link>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          label="Total Patients"
          value={initialPatients.length.toLocaleString()}
          icon="group"
          iconFill
          bgIcon="bg-primary/5 text-primary"
          trend="+4.2% from last month"
          trendIcon="trending_up"
          trendColor="text-emerald-600"
        />
        <StatsCard
          label="AI Predictions"
          value={initialReports.length}
          icon="psychology"
          iconFill
          bgIcon="bg-secondary-container/20 text-primary-container"
          trend="82% Accuracy Rate"
          trendIcon="check_circle"
          trendColor="text-primary"
        />
        <StatsCard
          label="Critical Alerts"
          value="03"
          icon="warning"
          iconFill
          bgIcon="bg-tertiary-container/10 text-tertiary"
          trend="Action required in Ward 4B"
          trendIcon="emergency"
          trendColor="text-tertiary"
        />
      </section>

      {/* Main Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-lowest p-8 rounded-xl animate-fade-in-up-delay-1">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-on-surface font-headline">Patient Health Overview</h3>
                <p className="text-sm text-outline font-body">Real-time vital trends across neurological ward</p>
              </div>
              <select className="bg-surface-container-low border-none rounded-lg text-sm font-bold text-primary px-4 py-2 focus:ring-0 font-body">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weeklyChartData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6e8ea" vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#737685', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#737685', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    padding: '12px 16px',
                  }}
                />
                <Bar dataKey="patients" fill="#003d9b" radius={[6, 6, 0, 0]} name="Patients" />
                <Bar dataKey="predictions" fill="#b2c5ff" radius={[6, 6, 0, 0]} name="Predictions" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-xl flex items-center gap-4 animate-fade-in-up-delay-2">
              <div className="w-14 h-14 rounded-full border-4 border-primary border-t-transparent flex items-center justify-center animate-spin-slow">
                <span className="text-xs font-black text-primary">88%</span>
              </div>
              <div>
                <h4 className="font-bold text-on-surface font-headline">Recovery Rate</h4>
                <p className="text-xs text-outline font-body">Positive prognosis trend</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl flex items-center gap-4 animate-fade-in-up-delay-3">
              <div className="w-14 h-14 rounded-full border-4 border-tertiary border-r-transparent flex items-center justify-center">
                <span className="text-xs font-black text-tertiary">12%</span>
              </div>
              <div>
                <h4 className="font-bold text-on-surface font-headline">Relapse Risk</h4>
                <p className="text-xs text-outline font-body">Actionable insights detected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="lg:col-span-1">
          <div className="bg-surface-container-lowest h-full rounded-xl p-8 flex flex-col animate-fade-in-up-delay-1">
            <h3 className="text-xl font-bold text-on-surface font-headline mb-8">Recent Activity</h3>
            <div className="flex-1 space-y-10 relative">
              <div className="absolute left-6 top-2 bottom-2 w-px bg-outline-variant/30"></div>
              {recentActivity.map((item) => (
                <div key={item.id} className="relative flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full bg-white shadow-sm ring-4 ring-surface-container-lowest flex items-center justify-center z-10 ${item.color}`}>
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface font-body">{item.title}</p>
                    <p className="text-xs text-on-surface-variant mt-1 font-body">{item.desc}</p>
                    <span className="text-[10px] font-bold text-outline uppercase mt-2 block font-label">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/reports"
              className="w-full py-4 mt-8 bg-surface-container-low text-primary font-bold text-sm rounded-xl hover:bg-white transition-colors text-center font-headline block"
            >
              View All Logs
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Diagnostic Overlay */}
      <div className="fixed bottom-10 right-10 z-50">
        <div className="glass-panel p-6 rounded-xl shadow-2xl border border-white/20 w-80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>
                electric_bolt
              </span>
              <h5 className="text-sm font-bold text-on-surface font-headline">Live Insight</h5>
            </div>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed mb-4 font-body">
            Patient <strong>#3302 (Ward 4B)</strong> showing increased intracranial pressure patterns. Immediate review suggested.
          </p>
          <div className="flex gap-2">
            <button className="flex-1 py-2 bg-primary text-on-primary text-[10px] font-bold uppercase tracking-wider rounded-lg font-label">
              View Record
            </button>
            <button className="flex-1 py-2 bg-surface-container-highest text-on-surface text-[10px] font-bold uppercase tracking-wider rounded-lg font-label">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
