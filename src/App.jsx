import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider, useUser } from './context/UserContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Solved from './pages/Solved'
import Search from './pages/Search'
import Buckets from './pages/Buckets'
import ProblemDetail from './pages/ProblemDetail'
import BucketDetail from './pages/BucketDetail'

function AppContent() {
  const { user, loading } = useUser()

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Solved />} />
        <Route path="/solved" element={<Solved />} />
        <Route path="/search" element={<Search />} />
        <Route path="/buckets" element={<Buckets />} />
        <Route path="/problem/:id" element={<ProblemDetail />} />
        <Route path="/bucket/:id" element={<BucketDetail />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </Router>
  )
}

export default App
