import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.')
      return
    }

    setLoading(true)

    // Simulate network delay
    await new Promise(r => setTimeout(r, 800))

    const result = login(email, password)
    if (result.success) {
      navigate('/', { replace: true })
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!resetEmail.trim()) {
      setError('Please enter your email address.')
      return
    }
    
    setLoading(true)
    
    try {
      const result = await api.forgotPassword(resetEmail)
      console.log('Password reset result:', result)
      setResetSuccess(true)
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setShowForgotPassword(false)
        setResetSuccess(false)
        setResetEmail('')
        setError('')
      }, 3000)
    } catch (err) {
      console.error('Password reset error:', err)
      setError(err.message || 'Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-container to-primary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Hospital Logo */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="w-20 h-20 mx-auto bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-6 ring-1 ring-white/20">
            <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              clinical_notes
            </span>
          </div>
          <h1 className="text-3xl font-black text-white font-headline tracking-tight">KDM Care Hospital</h1>
          <p className="text-blue-200 mt-2 text-sm font-body">AI Multimodal Disease Prediction System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 animate-fade-in-up-delay-1">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-on-surface font-headline">Welcome back</h2>
            <p className="text-on-surface-variant mt-1 text-sm font-body">Sign in to access your clinical dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-container rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-on-error-container text-lg">error</span>
              <p className="text-on-error-container text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label ml-1">
                Institutional Email
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-xl py-4 px-5 pr-12 text-on-surface font-body focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="doctor@kdmcare.hospital"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant">
                  alternate_email
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-xl py-4 px-5 pr-12 text-on-surface font-body focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Enter your password"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant">
                  lock
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-outline-variant text-primary focus:ring-primary/20" />
                <span className="text-sm text-on-surface-variant font-body">Remember me</span>
              </label>
              <button 
                type="button" 
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-primary font-medium hover:underline font-body"
              >
                Forgot password?
              </button>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl font-bold text-lg font-headline shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="spinner !w-5 !h-5 !border-2 !border-white/30 !border-t-white"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">login</span>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer hint */}
        <p className="text-center text-blue-200/60 text-xs mt-6 font-body animate-fade-in-up-delay-3">
          Protected by HIPAA compliance standards • v4.2.1
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-on-surface font-headline">Reset Password</h3>
              <button
                onClick={() => {
                  setShowForgotPassword(false)
                  setResetSuccess(false)
                  setResetEmail('')
                  setError('')
                }}
                className="text-outline-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {resetSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-emerald-600 text-3xl">check_circle</span>
                </div>
                <h4 className="text-xl font-bold text-on-surface mb-2 font-headline">Email Sent!</h4>
                <p className="text-on-surface-variant text-sm font-body">
                  Password reset instructions have been sent to <strong>{resetEmail}</strong>
                </p>
              </div>
            ) : (
              <>
                <p className="text-on-surface-variant text-sm mb-6 font-body">
                  Enter your institutional email address and we'll send you instructions to reset your password.
                </p>

                {error && (
                  <div className="mb-4 p-4 bg-error-container rounded-xl flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-error-container text-lg">error</span>
                    <p className="text-on-error-container text-sm font-medium">{error}</p>
                  </div>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label ml-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full bg-surface-container-low border-none rounded-xl py-4 px-5 pr-12 text-on-surface font-body focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="doctor@kdmcare.hospital"
                        autoFocus
                      />
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant">
                        alternate_email
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false)
                        setResetEmail('')
                        setError('')
                      }}
                      className="flex-1 py-3 bg-surface-container-high text-on-surface rounded-xl font-bold text-sm hover:bg-surface-container-highest transition-colors font-headline"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 font-headline flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="spinner !w-4 !h-4 !border-2 !border-white/30 !border-t-white"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-sm">send</span>
                          <span>Send Reset Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
