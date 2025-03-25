import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './index.css';

const Header: React.FC = () => {
  const { isLoggedIn, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="header">
      <div className="container header-content">
        <div className="logo">
          <Link to="/">
            <h1>Safe Spotter</h1>
            <p className="tagline">Navigate with confidence</p>
          </Link>
        </div>
        <nav className="nav">
          <ul className="nav-links">
            <li className={location.pathname === '/' ? 'active' : ''}>
              <Link to="/">Home</Link>
            </li>
            <li className={location.pathname === '/map' ? 'active' : ''}>
              <Link to="/map">Map</Link>
            </li>
            {isLoggedIn ? (
              <>
                <li className={location.pathname === '/profile' ? 'active' : ''}>
                  <Link to="/profile">Profile</Link>
                </li>
                <li>
                  <button onClick={logout} className="btn-logout">Logout</button>
                </li>
              </>
            ) : (
              <>
                <li className={location.pathname === '/login' ? 'active' : ''}>
                  <Link to="/login">Login</Link>
                </li>
                <li className={location.pathname === '/signup' ? 'active' : ''}>
                  <Link to="/signup">Signup</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;