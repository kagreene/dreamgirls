import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN } from '../api/reviewMutations';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './login.css';

const Login: React.FC = () => {
  const [formState, setFormState] = useState({ email: '', password: '' });
  const [login, { loading, error }] = useMutation(LOGIN);
  const { isLoggedIn, login: authLogin } = useAuth();

  // If already logged in, redirect to home
  if (isLoggedIn) {
    return <Navigate to="/" />;
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      const { data } = await login({
        variables: { ...formState },
      });
      
      const { token } = data.login;
      authLogin(token);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="page login-page">
      <div className="container">
        <div className="auth-form-container">
          <h2>Login</h2>
          <form onSubmit={handleFormSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                placeholder="Your email"
                name="email"
                id="email"
                value={formState.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                placeholder="Your password"
                name="password"
                id="password"
                value={formState.password}
                onChange={handleChange}
                required
              />
            </div>
            {error && (
              <div className="error-message">
                {error.message.includes('Invalid credentials')
                  ? 'Invalid email or password'
                  : 'An error occurred. Please try again.'}
              </div>
            )}
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading || !formState.email || !formState.password}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <p className="auth-redirect">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;