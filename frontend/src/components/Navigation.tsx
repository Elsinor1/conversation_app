import { Link, useNavigate } from 'react-router-dom'
import { clearStoredToken } from '../auth'

interface NavigationProps {
  isAuthenticated: boolean
  onLogout: () => void
}

export default function Navigation({ isAuthenticated, onLogout }: NavigationProps) {
  const navigate = useNavigate()

  const handleLogout = () => {
    clearStoredToken()
    onLogout()
    navigate('/')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
      <div className="container-fluid">
        <div className="w-100 d-flex justify-content-center">
          <ul className="navbar-nav flex-row">
            <li className="nav-item">
              <Link to="/" className="nav-link mx-3">
                Home
              </Link>
            </li>
            
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link to="/chat-setup" className="nav-link mx-3">
                    New Chat
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/chat" className="nav-link mx-3">
                    Chat
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    onClick={handleLogout}
                    className="nav-link btn btn-link text-danger border-0 mx-3"
                    style={{ textDecoration: 'none', padding: '0.5rem 1rem' }}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/login" className="nav-link mx-3">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="nav-link mx-3">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
