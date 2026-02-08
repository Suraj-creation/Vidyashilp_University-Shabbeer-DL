import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaTimes, FaChevronRight, FaHome, FaBook, FaTasks, FaBookReader, FaClipboardList, FaFileAlt, FaBoxOpen, FaShieldAlt, FaBars, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useStudentAuth } from '../context/StudentAuthContext';
import './Header.css';

// Navigation items configuration - Updated order, removed My Progress, renamed Curriculum to Lectures
const navItems = [
  { path: '/', label: 'Home', icon: <FaHome /> },
  { path: '/lectures', label: 'Lectures', icon: <FaBook /> },
  { path: '/assignments', label: 'Assignments', icon: <FaTasks /> },
  { path: '/tutorials', label: 'Tutorials', icon: <FaBookReader /> },
  { path: '/exams', label: 'Exams', icon: <FaClipboardList /> },
  { path: '/prerequisites', label: 'Prerequisites', icon: <FaFileAlt /> },
  { path: '/resources', label: 'Resources', icon: <FaBoxOpen /> },
];

// Breadcrumb mapping - Updated Curriculum to Lectures
const breadcrumbLabels = {
  '/': 'Home',
  '/lectures': 'Lectures',
  '/assignments': 'Assignments',
  '/tutorials': 'Tutorials',
  '/exams': 'Exams',
  '/prerequisites': 'Prerequisites',
  '/resources': 'Resources',
  '/admin': 'Admin',
  '/admin/login': 'Login',
};

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { student, isAuthenticated, logout } = useStudentAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Generate breadcrumbs
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) return [];
    
    const breadcrumbs = [{ path: '/', label: 'Home' }];
    let currentPath = '';
    
    paths.forEach(segment => {
      currentPath += `/${segment}`;
      breadcrumbs.push({
        path: currentPath,
        label: breadcrumbLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1)
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <>
      <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          {/* Logo */}
          <Link to="/" className="header-logo">
            <div className="logo-icon-wrapper">
              <svg className="logo-icon-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="dlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A78BFA" />
                    <stop offset="100%" stopColor="#4F46E5" />
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#dlGrad)" />
                <text x="20" y="27" textAnchor="middle" fontFamily="'Inter', sans-serif" fontWeight="800" fontSize="18" fill="#FFFFFF" letterSpacing="-0.5">DL</text>
              </svg>
            </div>
            <div className="logo-text-wrapper">
              <span className="logo-text">Deep<span className="logo-highlight">Learn</span></span>
              <span className="logo-subtext">Neural AI Course</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-text">{item.label}</span>
                <span className="nav-underline"></span>
              </Link>
            ))}
          </nav>

          {/* Header Actions */}
          <div className="header-actions">
            {/* Show user info or login button based on auth state */}
            {isAuthenticated ? (
              <div className="user-menu">
                <div className="user-profile-btn">
                  {student?.avatar ? (
                    <img src={student.avatar} alt={student.name} className="user-avatar" />
                  ) : (
                    <FaUser className="user-icon" />
                  )}
                  <span className="user-name">{student?.name?.split(' ')[0] || 'Student'}</span>
                </div>
                <button onClick={handleLogout} className="logout-btn" title="Logout">
                  <FaSignOutAlt />
                </button>
              </div>
            ) : (
              <Link to="/login" className="login-btn">
                <span>Login</span>
              </Link>
            )}

            {/* Admin Portal Button - Only shown when no student is logged in */}
            {!isAuthenticated && (
              <Link to="/admin/login" className="admin-portal-btn">
                <FaShieldAlt className="admin-icon" />
                <span className="admin-text">Admin Portal</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className={`mobile-menu-toggle ${isMobileMenuOpen ? 'open' : ''}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 1 && (
          <div className="breadcrumb-container">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                  {index > 0 && <FaChevronRight className="breadcrumb-separator" aria-hidden="true" />}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="breadcrumb-current" aria-current="page">{crumb.label}</span>
                  ) : (
                    <Link to={crumb.path} className="breadcrumb-link">{crumb.label}</Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      ></div>

      {/* Mobile Menu */}
      <nav 
        className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}
        aria-label="Mobile navigation"
      >
        <div className="mobile-menu-header">
          <div className="mobile-logo">
            <div className="logo-icon-wrapper small">
              <svg className="logo-icon-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="dlGradMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A78BFA" />
                    <stop offset="100%" stopColor="#4F46E5" />
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#dlGradMobile)" />
                <text x="20" y="27" textAnchor="middle" fontFamily="'Inter', sans-serif" fontWeight="800" fontSize="18" fill="#FFFFFF" letterSpacing="-0.5">DL</text>
              </svg>
            </div>
            <span>Deep<span className="logo-highlight">Learn</span></span>
          </div>
          <button 
            className="mobile-menu-close"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mobile-nav-links">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="mobile-nav-icon">{item.icon}</span>
              <span className="mobile-nav-text">{item.label}</span>
              <FaChevronRight className="mobile-nav-arrow" />
            </Link>
          ))}
        </div>

        <div className="mobile-menu-footer">
          {isAuthenticated ? (
            <>
              <div className="mobile-user-info">
                <FaUser /> {student?.name?.split(' ')[0] || 'Welcome'}
              </div>
              <button 
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                className="mobile-logout-btn"
              >
                <FaSignOutAlt /> Logout
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className="mobile-login-btn"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaUser /> Login
            </Link>
          )}
          {!isAuthenticated && (
            <Link 
              to="/admin/login" 
              className="mobile-admin-btn"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaShieldAlt /> Admin Portal
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default Header;
