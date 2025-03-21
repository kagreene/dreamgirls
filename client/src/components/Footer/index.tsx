import React from 'react';
import './index.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; {currentYear} Safe Spotter. All rights reserved.</p>
        <p>
          <a href="/about">About</a> | 
          <a href="/privacy">Privacy Policy</a> | 
          <a href="/terms">Terms of Service</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;