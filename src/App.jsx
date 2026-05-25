import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import { getCurrentUser } from './api';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) setUser(currentUser);
    setLoading(false);
  }, []);

  const handleRegisterSuccess = (userData) => {
    setUser(userData);
    setShowRegister(false);
  };

  const handleLoginSuccess = (userData) => setUser(userData);
  const handleLogout = () => setUser(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading LMS Platform...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <LanguageProvider>
        <ThemeProvider>
          {showRegister ? (
            <Register onSwitchToLogin={() => setShowRegister(false)} onRegisterSuccess={handleRegisterSuccess} />
          ) : (
            <Login onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setShowRegister(true)} />
          )}
        </ThemeProvider>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/*" element={<Dashboard user={user} onLogout={handleLogout} />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
