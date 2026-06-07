import { Link } from 'react-router-dom'
import { diseases } from '../data/mockData'

export default function PredictPage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Header */}
      <header className="mb-12 animate-fade-in-up">
        <h2 className="font-headline text-4xl font-extrabold text-primary tracking-tight mb-2">
          Select Disease for AI Prediction
        </h2>
        <p className="text-on-surface-variant max-w-2xl leading-relaxed font-body">
          Utilize our advanced neural networks and historical medical datasets at KDM Care Hospital to generate precision diagnostics for your patients.
        </p>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Hero Card: Brain Tumor */}
        <Link
          to="/predict/brain-tumor"
          className="md:col-span-8 group relative overflow-hidden bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 min-h-[320px] animate-fade-in-up"
        >
          <div className="absolute inset-0 z-0">
            <img
              alt="Brain MRI scan"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-40"
              src={diseases[0].image}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/60 to-transparent"></div>
          </div>
          <div className="relative z-10 p-8 h-full flex flex-col justify-end">
            <div className="flex items-center gap-2 mb-4">
              {diseases[0].tags.map(tag => (
                <span key={tag} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest font-label">
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="font-headline text-3xl font-bold text-on-surface mb-2">Brain Tumor Detection</h3>
            <p className="text-on-surface-variant mb-6 max-w-md font-body">{diseases[0].description}</p>
            <span className="w-fit px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 font-headline">
              Start Imaging Scan
              <span className="material-symbols-outlined">arrow_forward</span>
            </span>
          </div>
        </Link>

        {/* Secondary Cards: Pneumonia & Skin Cancer */}
        <div className="md:col-span-4 flex flex-col gap-6">
          {diseases.filter(d => ['pneumonia', 'skin-cancer'].includes(d.id)).map((disease, i) => (
            <Link
              key={disease.id}
              to={`/predict/${disease.id}`}
              className={`flex-1 bg-surface-container-lowest rounded-xl p-6 shadow-sm hover:shadow-md transition-all group cursor-pointer border border-transparent hover:border-primary/10 animate-fade-in-up-delay-${i + 1}`}
            >
              <div className="w-12 h-12 bg-surface-container-high rounded-xl flex items-center justify-center mb-6 text-primary">
                <span className="material-symbols-outlined text-3xl">{disease.icon}</span>
              </div>
              <h3 className="font-headline text-xl font-bold mb-2">{disease.name}</h3>
              <p className="text-sm text-on-surface-variant mb-4 font-body">{disease.description}</p>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter font-label">{disease.uploadLabel}</span>
                <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity">add_circle</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Eye Disease with Image */}
        <Link
          to="/predict/eye-disease"
          className="md:col-span-4 bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col group cursor-pointer animate-fade-in-up-delay-1"
        >
          <div className="h-40 overflow-hidden">
            <img
              alt="Close up of eye"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              src={diseases[3].image}
            />
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary">visibility</span>
              <h3 className="font-headline text-xl font-bold">Eye Disease</h3>
            </div>
            <p className="text-sm text-on-surface-variant mb-4 font-body">{diseases[3].description}</p>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xs text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="text-xs font-medium text-on-surface-variant font-body">Top Diagnostic Category</span>
            </div>
          </div>
        </Link>

        {/* Heart Disease - Tabular */}
        <Link
          to="/predict/heart-disease"
          className="md:col-span-4 bg-surface-container-low rounded-xl p-6 flex flex-col justify-between border-2 border-dashed border-outline-variant/30 hover:border-primary/20 transition-colors cursor-pointer animate-fade-in-up-delay-2"
        >
          <div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              </div>
              <span className="text-[10px] font-bold bg-white px-2 py-1 rounded-md text-on-surface-variant font-label">TABULAR MODEL</span>
            </div>
            <h3 className="font-headline text-xl font-bold mb-2">Heart Disease</h3>
            <p className="text-sm text-on-surface-variant font-body">{diseases[4].description}</p>
          </div>
          <div className="mt-8 space-y-2">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 font-label">
              <span>DATA POINTS REQUIRED</span>
              <span>{diseases[4].fields.length} PARAMETERS</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary w-3/4 h-full"></div>
            </div>
          </div>
        </Link>

        {/* Diabetes - Tabular */}
        <Link
          to="/predict/diabetes"
          className="md:col-span-4 bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col group cursor-pointer border border-transparent hover:border-primary/10 transition-all animate-fade-in-up-delay-3"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="w-12 h-12 bg-surface-container-high rounded-xl flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">medical_services</span>
            </div>
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-200"></div>
              <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-300"></div>
              <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-400"></div>
            </div>
          </div>
          <h3 className="font-headline text-xl font-bold mb-2">Diabetes Risk</h3>
          <p className="text-sm text-on-surface-variant mb-6 font-body">{diseases[5].description}</p>
          <div className="grid grid-cols-2 gap-2 mt-auto">
            <div className="bg-surface-container-low p-3 rounded-lg text-center">
              <div className="text-[10px] font-bold text-slate-500 uppercase font-label">Latency</div>
              <div className="text-sm font-bold text-primary font-headline">&lt; 200ms</div>
            </div>
            <div className="bg-surface-container-low p-3 rounded-lg text-center">
              <div className="text-[10px] font-bold text-slate-500 uppercase font-label">Dataset</div>
              <div className="text-sm font-bold text-primary font-headline">Pima-H</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Footer Stats */}
      <section className="mt-16 pt-8 border-t border-surface-container-high flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-8">
          <div>
            <div className="text-2xl font-bold text-on-surface font-headline">24.5k+</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-label">Predictions Today</div>
          </div>
          <div className="h-10 w-[1px] bg-surface-container-high"></div>
          <div>
            <div className="text-2xl font-bold text-on-surface font-headline">98.4%</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-label">Avg. Reliability</div>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors font-body">Documentation</button>
          <button className="px-6 py-2 bg-white rounded-full text-sm font-bold text-primary border border-primary/10 shadow-sm hover:shadow-md transition-all font-headline">
            Support Center
          </button>
        </div>
      </section>
    </div>
  )
}
