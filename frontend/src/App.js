/**
 * Main App Component
 * Handles authentication state and routing between login and todo list views
 */

import React, { useState, useEffect } from 'react';
import './App.css';
import Auth from './components/Auth';
import TodoApp from './components/TodoApp';

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // Check for existing token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  /**
   * Handle successful login/registration
   */
  const handleAuthSuccess = (authToken, authUser) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(authUser));
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <div className="App">
      {!token ? (
        <Auth onAuthSuccess={handleAuthSuccess} />
      ) : (
        <TodoApp token={token} user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
