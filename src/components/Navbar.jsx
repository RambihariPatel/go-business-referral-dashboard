import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Briefcase, Home, LogOut } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    Cookies.remove('jwt_token');
    navigate('/login');
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" aria-label="Go to dashboard home">
          <Briefcase className="brand-icon" size={22} />
          <span className="brand-name">Go Business</span>
        </Link>
        
        <nav className="navbar-navigation" aria-label="Primary">
          <Link 
            to="/" 
            className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <Home size={18} />
            <span>Home</span>
          </Link>
          <button 
            type="button" 
            onClick={handleLogout} 
            className="navbar-logout-btn"
          >
            <LogOut size={18} />
            <span>Log out</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
