import { useState } from 'react'
import { Login } from './components/Login'
import { AdminDashboard } from './components/AdminDashboard'

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null)

  const handleLoginSuccess = (user) => {
    setLoggedInUser(user)
  }

  // Admin dashboard takes the whole screen
  if (loggedInUser && loggedInUser.role === 'ADMIN') {
    return <AdminDashboard user={loggedInUser} onLogout={() => setLoggedInUser(null)} />
  }

  // Voter dashboard (post-login)
  if (loggedInUser) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0b1120',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        <div style={{
          width: '100%',
          maxWidth: 480,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '36px 32px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          color: '#f0fdfb',
          boxSizing: 'border-box',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg,#14b8a6,#0d9488)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="#fff" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: '-0.4px' }}>VoteChain</span>
          </div>

          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 600, color: '#f0fdfb', margin: '0 0 8px', letterSpacing: '-0.4px' }}>
            Voter Dashboard
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(148,163,184,0.8)', marginBottom: 24 }}>
            Welcome back, <strong style={{ color: '#14b8a6' }}>{loggedInUser.name}</strong>!
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {[
              ['Status', loggedInUser.status],
              ['Wallet', loggedInUser.walletAddress],
            ].map(([label, val]) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(148,163,184,0.5)', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 14, color: '#e2e8f0', wordBreak: 'break-all' }}>{val}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setLoggedInUser(null)}
            style={{
              width: '100%', padding: '12px 20px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 10, color: '#fca5a5',
              fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  // Not logged in → show the Login page
  return <Login onLoginSuccess={handleLoginSuccess} />
}

export default App
