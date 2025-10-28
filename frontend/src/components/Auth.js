/**
 * Auth Component
 * Handles user login and registration
 */

import React, { useState } from 'react';
import axios from 'axios';

function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Handle form submission for login or registration
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const response = await axios.post(endpoint, {
        username,
        password
      });

      // Call parent callback with token and user info
      onAuthSuccess(response.data.token, response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle between login and registration
   */
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>
        
        <div className="auth-switch">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={toggleMode}>
            {isLogin ? 'Register' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;
