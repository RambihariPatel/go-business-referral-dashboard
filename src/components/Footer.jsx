import React from 'react';

const Footer = () => {
  return (
    <footer className="footer-layout">
      <div className="footer-container">
        <div className="footer-info">
          <span className="footer-brand">Go Business</span>
          <span className="footer-copyright">© 2024 Go Business</span>
        </div>
        <nav className="footer-links-nav" aria-label="Footer">
          <a href="#about" className="footer-nav-link">About</a>
          <a href="#privacy" className="footer-nav-link">Privacy</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
