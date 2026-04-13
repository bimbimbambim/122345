import React, { useState, useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import StylesPage from './pages/StylesPage'
import UsersPage from './pages/UsersPage'
import GenerationsPage from './pages/GenerationsPage'
import Sidebar from './components/Sidebar'

export type Page = 'dashboard' | 'styles' | 'users' | 'generations'

export default function App() {
  const [token, setToken] = useState<string | null>(null)
  const [page, setPage] = useState<Page>('dashboard')

  useEffect(() => {
    const t = localStorage.getItem('admin_token')
    if (t) setToken(t)
  }, [])

  const handleLogin = (t: string) => {
    localStorage.setItem('admin_token', t)
    setToken(t)
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setToken(null)
  }

  if (!token) return <Login onLogin={handleLogin} />

  const pages: Record<Page, React.ReactNode> = {
    dashboard: <Dashboard />,
    styles: <StylesPage />,
    users: <UsersPage />,
    generations: <GenerationsPage />,
  }

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <Sidebar current={page} onChange={setPage} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto p-6">
        {pages[page]}
      </main>
    </div>
  )
}
