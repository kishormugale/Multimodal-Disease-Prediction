import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { doctor, updateDoctor } = useAuth()
  const [form, setForm] = useState({
    name: doctor.name.replace('Dr. ', ''),
    specialization: doctor.specialization,
    email: doctor.email,
    phone: doctor.phone,
  })
  const [saved, setSaved] = useState(false)

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateDoctor({
      name: `Dr. ${form.name}`,
      specialization: form.specialization,
      email: form.email,
      phone: form.phone,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleDiscard = () => {
    setForm({
      name: doctor.name.replace('Dr. ', ''),
      specialization: doctor.specialization,
      email: doctor.email,
      phone: doctor.phone,
    })
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Success Alert */}
      {saved && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in-up">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <span className="font-medium text-sm font-body">Profile updated successfully!</span>
        </div>
      )}

      <div className="mb-10 animate-fade-in-up">
        <h2 className="text-3xl font-extrabold text-primary font-headline tracking-tight">Doctor Profile</h2>
        <p className="text-slate-500 mt-2 font-body">Manage your professional credentials and clinical identity.</p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Identity & Photo */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm flex flex-col items-center text-center animate-fade-in-up-delay-1">
            <div className="relative group">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-surface-container-high transition-transform group-hover:scale-[1.02]">
                <img
                  alt="Doctor profile photo"
                  className="w-full h-full object-cover"
                  src={doctor.avatar}
                />
              </div>
              <button className="absolute bottom-2 right-2 bg-primary text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">photo_camera</span>
              </button>
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-bold font-headline text-on-surface">{doctor.name}</h3>
              <p className="text-primary font-medium font-body">{doctor.specialization}</p>
            </div>
            <div className="mt-8 w-full flex flex-col gap-3">
              <button className="w-full py-2.5 px-4 rounded-xl bg-surface-container-low text-on-surface-variant font-label text-sm font-semibold hover:bg-surface-container-high transition-colors">
                Update Photo
              </button>
              <button className="w-full py-2.5 px-4 rounded-xl border border-outline-variant/30 text-error font-label text-sm font-semibold hover:bg-error-container/20 transition-colors">
                Remove Image
              </button>
            </div>
          </section>

          <section className="bg-primary-container p-6 rounded-xl text-on-primary-container animate-fade-in-up-delay-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <span className="font-headline font-bold">Clinical Authority</span>
            </div>
            <p className="text-sm leading-relaxed opacity-90 font-body">
              Your profile is currently verified for precision diagnostic tools and high-priority patient data access.
            </p>
          </section>
        </div>

        {/* Right Column: Editable Form */}
        <div className="col-span-12 lg:col-span-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Professional Information */}
            <div className="bg-surface-container-lowest p-10 rounded-xl shadow-sm animate-fade-in-up-delay-1">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                <h4 className="text-lg font-bold font-headline">Professional Information</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-label ml-1">
                    Full Professional Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full bg-surface-container-low border-none rounded-xl py-4 px-5 text-on-surface font-body focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">person</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-label ml-1">
                    Specialization Area
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.specialization}
                      onChange={(e) => handleChange('specialization', e.target.value)}
                      className="w-full bg-surface-container-low border-none rounded-xl py-4 px-5 text-on-surface font-body focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">medical_services</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-label ml-1">
                    Institutional Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="w-full bg-surface-container-low border-none rounded-xl py-4 px-5 text-on-surface font-body focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">alternate_email</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-label ml-1">
                    Contact Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="w-full bg-surface-container-low border-none rounded-xl py-4 px-5 text-on-surface font-body focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">call</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Visibility */}
            <div className="bg-surface-container-low p-10 rounded-xl flex flex-col md:flex-row gap-10 items-start animate-fade-in-up-delay-2">
              <div className="flex-1 space-y-4">
                <h4 className="text-lg font-bold font-headline text-on-surface">Data Visibility Settings</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-body">
                  Adjust how your clinical notes and diagnostic assessments are signed and attributed across the KDM Care network.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-10 h-5 bg-primary-container rounded-full relative cursor-pointer">
                    <div className="w-3.5 h-3.5 bg-white rounded-full absolute right-1 top-[3px] shadow-sm"></div>
                  </div>
                  <span className="text-sm font-medium font-body">Public Academic Profile</span>
                </div>
              </div>
              <div className="w-full md:w-64 glass-panel p-6 rounded-xl border border-white/50 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <span className="material-symbols-outlined text-sm">info</span>
                  <span className="text-xs font-bold uppercase font-label">Security Note</span>
                </div>
                <p className="text-[11px] text-slate-600 italic font-body">
                  Institutional emails are locked to the @kdmcare.hospital domain for audit compliance.
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end items-center gap-4 pt-4 animate-fade-in-up-delay-3">
              <button
                type="button"
                onClick={handleDiscard}
                className="px-8 py-3.5 rounded-xl font-headline font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                Discard Changes
              </button>
              <button
                type="submit"
                className="px-10 py-3.5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all font-headline font-bold"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
