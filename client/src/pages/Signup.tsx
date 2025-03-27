import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ADD_USER } from '../api/reviewMutations';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './login.css';

const Signup: React.FC = () => {
  const [formState, setFormState] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [addUser, { loading, error }] = useMutation(ADD_USER);
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

    // Check password match if confirmPassword field is being updated
    if (name === 'confirmPassword' || (name === 'password' && formState.confirmPassword)) {
      if (name === 'password' && value !== formState.confirmPassword) {
        setPasswordError('Passwords do not match');
      } else if (name === 'confirmPassword' && value !== formState.password) {
        setPasswordError('Passwords do not match');
      } else {
        setPasswordError('');
      }
    }
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Check if passwords match
    if (formState.password !== formState.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    try {
      const { data } = await addUser({
        variables: {
          username: formState.username,
          email: formState.email,
          password: formState.password,
        },
      });
      
      const { token } = data.addUser;
      authLogin(token);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="page signup-page">
      <div className="container">
        <div className="auth-form-container">
          <h2>Create an Account</h2>
          <form onSubmit={handleFormSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                placeholder="Choose a username"
                name="username"
                id="username"
                value={formState.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                placeholder="Your email address"
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
                placeholder="Create a password"
                name="password"
                id="password"
                value={formState.password}
                onChange={handleChange}
                minLength={5}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                name="confirmPassword"
                id="confirmPassword"
                value={formState.confirmPassword}
                onChange={handleChange}
                minLength={5}
                required
              />
              {passwordError && <p className="password-error">{passwordError}</p>}
            </div>
            {error && (
              <div className="error-message">
                {error.message.includes('Username or email already exists')
                  ? 'Username or email is already taken'
                  : 'An error occurred. Please try again.'}
              </div>
            )}
            <button
              className="btn btn-primary"
              type="submit"
              disabled={
                loading ||
                !formState.username ||
                !formState.email ||
                !formState.password ||
                !formState.confirmPassword ||
                !!passwordError
              }
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
            <p className="auth-redirect">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
