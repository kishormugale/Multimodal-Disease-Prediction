import { useState, useEffect } from 'react'
import { api } from '../services/api'

function AddPatientModal({ isOpen, onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', age: '', gender: 'Male' })
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Patient name is required.'); return }
    if (!form.age || form.age < 0 || form.age > 150) { setError('Valid age is required.'); return }
    try {
      const newPatient = await api.createPatient({
        name: form.name,
        age: parseInt(form.age),
        gender: form.gender,
        status: 'Admitted'
      });
      onAdd(newPatient);
      setForm({ name: '', age: '', gender: 'Male' })
      setError('')
      onClose()
    } catch (err) {
      setError('Failed to create patient: ' + err.message);
    }

  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fade-in-up">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold font-headline text-on-surface">Add New Patient</h3>
          <button onClick={onClose} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
            <span className="material-symbols-outlined text-outline">close</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-error-container rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-on-error-container text-sm">error</span>
            <p className="text-on-error-container text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Patient Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-on-surface font-body focus:ring-2 focus:ring-primary/20"
              placeholder="Full patient name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Age</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => setForm(p => ({ ...p, age: e.target.value }))}
                className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-on-surface font-body focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. 45"
                min="0"
                max="150"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm(p => ({ ...p, gender: e.target.value }))}
                className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-on-surface font-body focus:ring-2 focus:ring-primary/20"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl font-bold font-headline shadow-lg shadow-primary/20 hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">person_add</span>
            Add Patient
          </button>
        </form>
      </div>
    </div>
  )
}

const statusStyles = {
  Stable: 'bg-secondary-container text-on-secondary-container',
  Critical: 'bg-error-container text-on-error-container',
  Admitted: 'bg-surface-container-highest text-on-surface-variant',
}

export default function PatientsPage() {
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getPatients()
      .then(data => {
        setPatients(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to load patients:", err)
        setLoading(false)
      })
  }, [])

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  )

  const addPatient = (patient) => {
    setPatients(prev => [patient, ...prev])
    setSuccessMsg(`Patient ${patient.name} added successfully!`)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Success Alert */}
      {successMsg && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in-up">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <span className="font-medium text-sm">{successMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight font-headline">Patient Management</h1>
          <p className="text-outline mt-1 font-body">KDM Care Hospital Central Registry</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-br from-primary to-primary-container text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[0.98] transition-all font-bold font-headline"
        >
          <span className="material-symbols-outlined">person_add</span>
          Add Patient
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in-up-delay-1">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
          <span className="text-xs font-bold text-outline tracking-wider uppercase font-label">Active Patients</span>
          <p className="text-3xl font-bold text-primary mt-2 font-headline">{patients.length}</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
          <span className="text-xs font-bold text-outline tracking-wider uppercase font-label">Critical</span>
          <p className="text-3xl font-bold text-tertiary mt-2 font-headline">{patients.filter(p => p.status === 'Critical' || p.status === 'Critical Monitoring').length}</p>
        </div>
        <div className="md:col-span-2 bg-gradient-to-r from-primary-container to-primary p-6 rounded-xl shadow-sm text-white flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-xs font-bold opacity-80 tracking-wider uppercase font-label">AI Diagnostic Readiness</span>
            <p className="text-3xl font-bold mt-2 font-headline">94.8% Accuracy</p>
            <p className="text-sm opacity-90 mt-1 font-body">System optimized for high-risk triage analysis</p>
          </div>
          <span className="material-symbols-outlined text-8xl opacity-10 absolute -right-4 -bottom-4">psychology</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-low rounded-xl p-4 flex flex-wrap gap-4 items-center animate-fade-in-up-delay-2">
        <div className="flex-1 min-w-[240px] relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">filter_list</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-lowest border-none rounded-lg pl-12 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 font-body"
            placeholder="Quick filter by name or ID..."
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm animate-fade-in-up-delay-3">
        {loading ? (
          <div className="flex justify-center p-12">
            <span className="material-symbols-outlined animate-slow-spin text-primary text-4xl">refresh</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-container-high text-left">
                <th className="px-6 py-4 text-xs font-bold text-outline tracking-wider uppercase font-label">Patient Name</th>
                <th className="px-6 py-4 text-xs font-bold text-outline tracking-wider uppercase font-label">Patient ID</th>
                <th className="px-6 py-4 text-xs font-bold text-outline tracking-wider uppercase font-label text-center">Age</th>
                <th className="px-6 py-4 text-xs font-bold text-outline tracking-wider uppercase font-label">Gender</th>
                <th className="px-6 py-4 text-xs font-bold text-outline tracking-wider uppercase font-label">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-outline tracking-wider uppercase font-label text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high">
              {filtered.map(patient => (
                <tr key={patient.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-sm">
                        {getInitials(patient.name)}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface font-body">{patient.name}</p>
                        <p className="text-xs text-outline font-body">{patient.lastVisit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-on-surface-variant font-body">#{patient.id}</td>
                  <td className="px-6 py-5 text-sm text-on-surface text-center font-body">{patient.age}</td>
                  <td className="px-6 py-5 text-sm text-on-surface font-body">{patient.gender}</td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusStyles[patient.status] || statusStyles.Admitted}`}>
                      {patient.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="px-4 py-2 rounded-lg bg-primary/5 text-primary font-bold text-sm hover:bg-primary hover:text-white transition-all font-headline">
                      Select
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-outline font-body">
                    <span className="material-symbols-outlined text-4xl text-outline-variant mb-2 block">search_off</span>
                    No patients found matching "{search}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
        <div className="px-6 py-4 bg-surface-container-low flex justify-between items-center border-t border-surface-container-high">
          <p className="text-xs text-outline font-medium font-body">Showing {filtered.length} of {patients.length} records</p>
        </div>
      </div>

      <AddPatientModal isOpen={showModal} onClose={() => setShowModal(false)} onAdd={addPatient} />
    </div>
  )
}
