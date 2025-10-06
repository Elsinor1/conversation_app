import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import { getStoredToken } from "./auth";
import Navigation from "./components/Navigation";
import TopBar from "./components/TopBar";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Chat from "./components/Chat";
import ChatSetup from "./components/ChatSetup";

function App() {
  const [token, setToken] = useState(() => getStoredToken() || "");
  const isAuthenticated = !!token;

  const handleLogin = (newToken: string) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    setToken("");
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route
            path="/"
            element={<Home isAuthenticated={isAuthenticated} onLogout={handleLogout} />}
          />
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/chat" replace />
              ) : (
                <>
                  <TopBar isAuthenticated={isAuthenticated} setIsAuthenticated={handleLogout} />
                  <Login onLogin={handleLogin} />
                </>
              )
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to="/chat" replace />
              ) : (
                <>
                  <TopBar isAuthenticated={isAuthenticated} setIsAuthenticated={handleLogout} />
                  <Register onLogin={handleLogin} />
                </>
              )
            }
          />
          <Route
            path="/chat-setup"
            element={
              isAuthenticated ? (
                <>
                  <TopBar isAuthenticated={isAuthenticated} setIsAuthenticated={handleLogout} />
                  <Navigation isAuthenticated={isAuthenticated} />
                  <ChatSetup token={token} />
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/chat"
            element={
              isAuthenticated ? (
                <>
                  <TopBar isAuthenticated={isAuthenticated} setIsAuthenticated={handleLogout} />
                  <Navigation isAuthenticated={isAuthenticated} />
                  <Chat token={token} />
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
