import { useState, useEffect } from 'react'
import { api } from '../services/api'

const riskStyles = {
  High: 'bg-error-container text-on-error-container',
  Medium: 'bg-secondary-container text-on-secondary-container',
  Low: 'bg-emerald-100 text-emerald-700',
}

const riskBarColors = {
  High: 'bg-error',
  Medium: 'bg-primary',
  Low: 'bg-emerald-500',
}

export default function ReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [downloading, setDownloading] = useState(null)

  useEffect(() => {
    api.getReports()
      .then(data => setReports(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleDownloadPDF = async (reportId, diseaseName) => {
    setDownloading(reportId)
    try {
      const blob = await api.downloadReportPDF(reportId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `KDM_Care_Report_${diseaseName.replace(/\s+/g, '_')}_${reportId.substring(0, 8)}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('PDF download failed:', err)
      alert('Failed to download PDF report')
    } finally {
      setDownloading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="spinner"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <span className="material-symbols-outlined text-5xl text-error mb-4">error</span>
        <p className="text-on-surface font-bold font-headline">Failed to load reports</p>
        <p className="text-on-surface-variant text-sm mt-1 font-body">{error}</p>
      </div>
    )
  }
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-full uppercase tracking-wider font-label">
              Historical Archives
            </span>
          </div>
          <h2 className="text-3xl font-black text-on-surface tracking-tight font-headline">Reports & History</h2>
          <p className="text-slate-500 mt-1 max-w-lg font-body">
            Comprehensive audit trail of AI-assisted clinical predictions for KDM Care Hospital.
          </p>
        </div>
        <div className="bg-surface-container-lowest p-1.5 rounded-xl shadow-sm flex items-center gap-2 border border-outline-variant/20">
          <div className="flex items-center px-4 py-2 gap-3 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-primary text-xl">calendar_today</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter font-label">Date Range</span>
              <span className="text-sm font-semibold text-on-surface font-body">Oct 01 - Oct 31, 2024</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <button className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity font-headline">
            Apply Filter
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up-delay-1">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">analytics</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-label">+12% vs last month</span>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider font-label">Total Predictions</p>
          <h3 className="text-2xl font-black text-on-surface mt-1 font-headline">{reports.length}</h3>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined">verified_user</span>
            </div>
            <span className="text-xs font-bold text-slate-400 px-2 py-1 font-label">Avg Confidence</span>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider font-label">Precision Accuracy</p>
          <h3 className="text-2xl font-black text-on-surface mt-1 font-headline">
            {(reports.reduce((sum, r) => sum + r.confidence, 0) / reports.length).toFixed(1)}%
          </h3>
        </div>
        <div className="bg-primary p-6 rounded-xl shadow-lg shadow-primary/20 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-200 text-xs font-bold uppercase tracking-wider font-label">Latest Activity</p>
            <h3 className="text-xl font-bold text-white mt-1 font-headline">
              {reports[0]?.patientName || 'N/A'}
            </h3>
            <p className="text-blue-100 text-sm mt-2 opacity-80 font-body">
              Diagnosis: {reports[0]?.disease}<br />
              Status: {reports[0]?.risk} Risk Identified
            </p>
          </div>
          <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl text-white/10">monitoring</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden animate-fade-in-up-delay-2">
        <div className="px-6 py-4 flex justify-between items-center bg-surface-container-low/50">
          <h3 className="font-bold text-on-surface font-headline">Clinical Prediction Logs</h3>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-white rounded-lg transition-colors">
              <span className="material-symbols-outlined text-slate-500">download</span>
            </button>
            <button className="p-2 hover:bg-white rounded-lg transition-colors">
              <span className="material-symbols-outlined text-slate-500">filter_list</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline-variant/10">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest font-label">Patient Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest font-label">Disease Target</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest font-label">Result</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest font-label">Confidence</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest font-label text-right">Analysis Date</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest font-label text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map(report => {
                const initials = report.patientName.split(' ').map(n => n[0]).join('').toUpperCase()
                return (
                  <tr key={report.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-primary">
                          {initials}
                        </div>
                        <span className="text-sm font-bold text-on-surface font-body">{report.patientName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600 font-medium font-body">{report.disease}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 text-[11px] font-bold rounded-full ${riskStyles[report.risk]}`}>
                        {report.risk} Risk
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1 w-32">
                        <span className="text-[10px] font-bold text-slate-500 font-label">{report.confidence}%</span>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${riskBarColors[report.risk]}`} style={{ width: `${report.confidence}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className="text-sm font-bold text-on-surface font-body">
                        {new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-[10px] text-slate-400 font-label">{report.time}</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={() => handleDownloadPDF(report.id, report.disease)}
                        disabled={downloading === report.id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 font-headline"
                        title="Download PDF Report"
                      >
                        {downloading === report.id ? (
                          <>
                            <div className="spinner !w-4 !h-4 !border-2 !border-white/30 !border-t-white"></div>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-sm">download</span>
                            <span>PDF</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 bg-surface-container-lowest">
          <p className="text-xs text-slate-500 font-medium font-body">
            Showing <span className="font-bold text-on-surface">1 - {reports.length}</span> of {reports.length} entries
          </p>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs">1</button>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up-delay-3">
        <div className="bg-gradient-to-br from-surface-container-low to-surface-container-lowest p-8 rounded-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="text-lg font-black text-on-surface mb-2 font-headline">Automated Insights</h4>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 font-body">
              Based on last week's predictions, we've detected a <span className="font-bold text-primary">5% increase</span> in
              critical cardiovascular flags in your region. Would you like to download the demographic breakdown?
            </p>
            <button className="px-6 py-2.5 bg-white border border-outline-variant/30 text-primary font-bold text-sm rounded-xl shadow-sm hover:shadow-md transition-all font-headline">
              View Trend Analysis
            </button>
          </div>
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
        </div>
        <div className="bg-surface-container-highest p-8 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined">security</span>
            </div>
            <h4 className="text-lg font-black text-on-surface font-headline">Data Integrity & HIPAA</h4>
          </div>
          <p className="text-on-surface-variant/80 text-sm leading-relaxed font-body">
            Your reports are fully encrypted and meet all HIPAA compliance standards for KDM Care Hospital.
            All identifying data is masked for research exports.
          </p>
        </div>
      </div>
    </div>
  )
}
