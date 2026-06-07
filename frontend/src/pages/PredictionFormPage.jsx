import { useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { diseases } from '../data/mockData'
import { api } from '../services/api'

function ImageUploader({ onFileSelect }) {
  const [preview, setPreview] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(file)
      onFileSelect(file)
    }
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }, [])

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragActive(true)
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragActive(false)}
      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
        dragActive
          ? 'border-primary bg-primary/5'
          : 'border-outline-variant/40 hover:border-primary/30 hover:bg-surface-container-low'
      }`}
    >
      {preview ? (
        <div className="space-y-4">
          <img src={preview} alt="Medical scan preview" className="max-h-64 mx-auto rounded-xl shadow-md" />
          <button
            type="button"
            onClick={() => { setPreview(null); onFileSelect(null) }}
            className="text-sm text-error font-medium hover:underline font-body"
          >
            Remove & re-upload
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-surface-container-high rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-primary">cloud_upload</span>
          </div>
          <div>
            <p className="text-on-surface font-bold font-headline">Drag & drop medical scan here</p>
            <p className="text-sm text-on-surface-variant mt-1 font-body">or click to browse files (PNG, JPG, DICOM)</p>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      )}
    </div>
  )
}

function PredictionResult({ result, disease }) {
  if (!result) return null

  const riskColors = {
    High: 'bg-tertiary-container text-on-tertiary-fixed',
    Medium: 'bg-secondary-container text-on-secondary-container',
    Low: 'bg-emerald-100 text-emerald-700',
  }

  const resultColor = result.result === 'Positive' ? 'border-tertiary' : 'border-emerald-500'

  const handleDownloadPDF = async () => {
    if (!result?.reportId) {
      alert('Report ID not available. Please access the report from the Reports page.')
      return
    }
    
    try {
      await api.downloadReportPDF(result.reportId)
    } catch (err) {
      console.error('PDF download failed:', err)
      alert('Failed to download PDF. Please try again from the Reports page.')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Main Result Card */}
      <div className={`relative overflow-hidden bg-surface-container-lowest rounded-xl shadow-2xl shadow-primary/10 p-8 border-t-8 ${resultColor} transition-all`}>
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1 font-label">Diagnostic Output</p>
            <h3 className="text-3xl font-black text-on-surface font-headline">{result.result}</h3>
          </div>
          <span className={`rounded-full px-4 py-1 text-xs font-bold tracking-tighter uppercase ${riskColors[result.risk]}`}>
            {result.risk} Risk
          </span>
        </div>

        {/* Confidence Score */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-3">
            <span className="text-sm font-semibold text-on-surface-variant font-body">Confidence Score</span>
            <span className="text-4xl font-black text-primary font-headline">
              {result.confidence}<span className="text-xl font-bold">%</span>
            </span>
          </div>
          <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${result.confidence}%` }}
            ></div>
          </div>
        </div>

        {/* Medical Suggestion */}
        <div className={`p-5 rounded-xl border-l-4 ${result.result === 'Positive' ? 'bg-tertiary/5 border-tertiary' : 'bg-emerald-50 border-emerald-500'}`}>
          <div className={`flex items-center gap-2 mb-2 ${result.result === 'Positive' ? 'text-tertiary' : 'text-emerald-600'}`}>
            <span className="material-symbols-outlined text-lg">medical_information</span>
            <h4 className="font-bold text-sm font-headline">Medical Suggestion</h4>
          </div>
          <p className="text-on-surface text-sm leading-relaxed font-medium font-body">
            {result.suggestion}
          </p>
        </div>

        <div className="flex gap-4 mt-6">
          <button 
            onClick={handleDownloadPDF}
            className="flex-1 py-3 bg-surface-container-high text-on-surface rounded-xl font-bold text-sm hover:bg-surface-container-highest transition-colors font-headline"
          >
            Download PDF
          </button>
          <button className="flex-1 py-3 bg-surface-container-high text-on-surface rounded-xl font-bold text-sm hover:bg-surface-container-highest transition-colors font-headline">
            Share Report
          </button>
        </div>

        {/* Decorative */}
        <div className="absolute -bottom-6 -right-6 opacity-5 pointer-events-none">
          <span className="material-symbols-outlined text-[160px]" style={{ fontVariationSettings: "'FILL' 1" }}>ecg</span>
        </div>
      </div>

      {/* AI Explanation */}
      <div className="bg-primary-container text-white rounded-xl p-6 relative overflow-hidden">
        <div className="relative z-10">
          <h4 className="font-bold mb-2 flex items-center gap-2 font-headline">
            <span className="material-symbols-outlined text-sm">verified</span> AI Explanation
          </h4>
          <p className="text-xs text-on-primary-container leading-relaxed opacity-90 font-body">
            The neural model analyzed input parameters against 24,500+ historical cases. Primary contributing factors have been weighted
            and cross-validated with clinical guidelines for {disease?.name || 'this condition'}.
          </p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
      </div>
    </div>
  )
}

export default function PredictionFormPage() {
  const { diseaseId } = useParams()
  const disease = diseases.find(d => d.id === diseaseId)
  const [formData, setFormData] = useState({})
  const [selectedFile, setSelectedFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  if (!disease) {
    return (
      <div className="text-center py-20">
        <span className="material-symbols-outlined text-6xl text-outline-variant">error</span>
        <h2 className="text-2xl font-bold text-on-surface mt-4 font-headline">Disease not found</h2>
        <Link to="/predict" className="text-primary font-medium mt-2 inline-block hover:underline">← Back to predictions</Link>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const params = disease.type === 'tabular' ? formData : {}
      const prediction = await api.predictDisease(diseaseId, params, selectedFile)
      setResult(prediction)
    } catch (err) {
      console.error(err)
      setResult({ result: 'Error', risk: 'Low', confidence: 0, suggestion: 'Failed to connect to AI engine.' })
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-sm font-body">
        <Link to="/predict" className="text-primary hover:underline font-medium">Predict</Link>
        <span className="text-outline">/</span>
        <span className="text-on-surface-variant">{disease.name}</span>
      </div>

      <header className="mb-10 animate-fade-in-up">
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">{disease.name} Prediction</h1>
        <p className="text-on-surface-variant font-medium font-body">Analyze clinical parameters for diagnostic probability at KDM Care Hospital.</p>
      </header>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Input Form */}
        <div className="xl:col-span-7 space-y-8">
          <section className="bg-surface-container-low rounded-xl p-8 animate-fade-in-up-delay-1">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-primary">analytics</span>
              <h2 className="text-xl font-bold font-headline">
                {disease.type === 'image' ? 'Medical Scan Upload' : 'Patient Vitals & Data'}
              </h2>
            </div>

            <form onSubmit={handleSubmit}>
              {disease.type === 'tabular' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                  {disease.fields.map(field => (
                    <div key={field.key} className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-label">
                        {field.label}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          value={formData[field.key] || ''}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          className="w-full bg-surface-container-lowest border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all text-on-surface font-body"
                        >
                          {field.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={formData[field.key] || ''}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full bg-surface-container-lowest border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline-variant font-body"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mb-8">
                  <ImageUploader onFileSelect={setSelectedFile} />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 font-headline disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="spinner !w-5 !h-5 !border-2 !border-white/30 !border-t-white"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">clinical_notes</span>
                    <span>Run AI Diagnostic Analysis</span>
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Bottom info cards */}
          <div className="grid grid-cols-2 gap-4 animate-fade-in-up-delay-2">
            <div className="bg-surface-container-low rounded-xl p-6 flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-secondary mb-2">history</span>
              <p className="text-xs font-bold uppercase tracking-widest text-outline font-label">Last Assessment</p>
              <p className="text-lg font-bold text-on-surface font-headline">14 Oct, 2024</p>
            </div>
            <div className="bg-surface-container-low rounded-xl p-6 flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-secondary mb-2">database</span>
              <p className="text-xs font-bold uppercase tracking-widest text-outline font-label">Model Integrity</p>
              <p className="text-lg font-bold text-on-surface font-headline">v4.2.1 Stable</p>
            </div>
          </div>
        </div>

        {/* Result Panel */}
        <div className="xl:col-span-5">
          <div className="sticky top-24">
            {loading && (
              <div className="bg-surface-container-lowest rounded-xl p-12 flex flex-col items-center justify-center text-center shadow-sm animate-fade-in-up">
                <div className="spinner mb-4"></div>
                <h3 className="text-xl font-bold text-on-surface font-headline mb-2">AI Processing</h3>
                <p className="text-sm text-on-surface-variant font-body">Analyzing medical data through our neural network pipeline...</p>
              </div>
            )}

            {!loading && !result && (
              <div className="bg-surface-container-lowest rounded-xl p-12 flex flex-col items-center justify-center text-center shadow-sm border-2 border-dashed border-outline-variant/20">
                <span className="material-symbols-outlined text-6xl text-outline-variant/40 mb-4">biotech</span>
                <h3 className="text-xl font-bold text-on-surface font-headline mb-2">Awaiting Input</h3>
                <p className="text-sm text-on-surface-variant font-body max-w-xs">
                  {disease.type === 'image'
                    ? 'Upload a medical scan and run the analysis to see AI predictions.'
                    : 'Fill in the patient parameters and run the analysis to generate predictions.'}
                </p>
              </div>
            )}

            {!loading && result && (
              <PredictionResult result={result} disease={disease} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
