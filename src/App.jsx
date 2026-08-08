import { useState } from 'react'
import { Login } from './components/Login'
import { AdminDashboard } from './components/AdminDashboard'
import { VoterDashboard } from './components/VoterDashboard'
import { ResultsDashboard } from './components/ResultsDashboard'

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null)
  const [view, setView] = useState('app') // 'app' | 'results'

  const handleLoginSuccess = (user) => {
    setLoggedInUser(user)
    setView('app')
  }

  if (view === 'results') {
    return (
      <ResultsDashboard
        onBack={() => setView('app')}
      />
    )
  }

  // Admin dashboard takes the whole screen
  if (loggedInUser && loggedInUser.role === 'ADMIN') {
    return (
      <AdminDashboard
        user={loggedInUser}
        onLogout={() => setLoggedInUser(null)}
        onOpenResults={() => setView('results')}
      />
    )
  }

  // Voter dashboard (post-login)
  if (loggedInUser) {
    return (
      <VoterDashboard
        user={loggedInUser}
        onLogout={() => setLoggedInUser(null)}
        onOpenResults={() => setView('results')}
      />
    )
  }

  // Not logged in → show the Login page
  return (
    <Login
      onLoginSuccess={handleLoginSuccess}
      onOpenResults={() => setView('results')}
    />
  )
}

export default App
