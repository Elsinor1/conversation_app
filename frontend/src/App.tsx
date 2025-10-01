import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { getStoredToken } from './auth'
import Navigation from './components/Navigation'
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'
import Chat from './components/Chat'
import ChatSetup from './components/ChatSetup'

function App() {
  const [token, setToken] = useState(() => getStoredToken() || '')
  const isAuthenticated = !!token

  const handleLogin = (newToken: string) => {
    setToken(newToken)
  }

  const handleLogout = () => {
    setToken('')
  }

  return (
    <Router>
      <div className="min-vh-100 bg-light">
        <Navigation isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home isAuthenticated={isAuthenticated} />} />
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/chat" replace /> : 
                <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/register" 
            element={
              isAuthenticated ? 
                <Navigate to="/chat" replace /> : 
                <Register onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/chat-setup" 
            element={
              isAuthenticated ? 
                <ChatSetup token={token} /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/chat" 
            element={
              isAuthenticated ? 
                <Chat token={token} /> : 
                <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
