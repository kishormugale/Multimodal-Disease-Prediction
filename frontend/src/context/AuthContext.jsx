import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const defaultDoctor = {
  id: 1,
  name: 'Dr. Alexander Smith',
  email: 'a.smith@kdmcare.hospital',
  specialization: 'Senior Neurologist',
  phone: '+1 (555) 902-3481',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0VZWEYdW-II_v6gv-DWUxaY6LK53KGeli1vOyIW6qNYsY8Ox-55tOGanKuC4GIpsiCX4phN014RRu3VRaDCYvuP4mcwmiMXFITmkLa3F4bERSuHoJPwaSOXNr0nvqfOP4cK9aSnEw4HoDJnlG1z0IccFlOjQGzzUnbetpOzUZn4ARvjhcPkUD7Sc_CUfnShsdU4YxcT0sZqcfI1SdqjDXjVJS_5sPkzvo6jjeXzuXSZA3Wvj-IZhnU6lfVov122qU5d55aHl6SwkO',
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('kdm_auth') === 'true'
  })
  const [doctor, setDoctor] = useState(defaultDoctor)

  const login = (email, password) => {
    // Mock validation
    if (email && password.length >= 4) {
      setIsAuthenticated(true)
      localStorage.setItem('kdm_auth', 'true')
      return { success: true }
    }
    return { success: false, error: 'Invalid credentials. Please try again.' }
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('kdm_auth')
  }

  const updateDoctor = (updates) => {
    setDoctor(prev => ({ ...prev, ...updates }))
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, doctor, login, logout, updateDoctor }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
