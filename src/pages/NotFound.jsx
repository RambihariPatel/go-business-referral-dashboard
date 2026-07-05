import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="not-found-page-wrapper">
      <div className="not-found-card">
        <AlertCircle size={48} className="not-found-brand-icon" />
        <h1 className="not-found-code">404</h1>
        <p className="not-found-subtitle">Page not found</p>
        <div className="not-found-detailed-text">
          404 - Page Not Found
        </div>
        <Link to="/" className="not-found-home-link">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
