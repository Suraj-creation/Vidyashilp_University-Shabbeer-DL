import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, FaBook, FaGraduationCap, FaTasks, 
  FaBookReader, FaClipboardList, FaFileAlt, FaBoxOpen, 
  FaSignOutAlt, FaUsers 
} from 'react-icons/fa';
import './AdminLayout.css';

const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/admin', icon: <FaHome />, label: 'Dashboard', exact: true },
    { path: '/admin/courses', icon: <FaBook />, label: 'Courses' },
    { path: '/admin/lectures', icon: <FaGraduationCap />, label: 'Lectures' },
    { path: '/admin/assignments', icon: <FaTasks />, label: 'Assignments' },
    { path: '/admin/tutorials', icon: <FaBookReader />, label: 'Tutorials' },
    { path: '/admin/prerequisites', icon: <FaClipboardList />, label: 'Prerequisites' },
    { path: '/admin/exams', icon: <FaFileAlt />, label: 'Exams' },
    { path: '/admin/resources', icon: <FaBoxOpen />, label: 'Resources' },
    { path: '/admin/users', icon: <FaUsers />, label: 'Users' },
  ];

  const isActive = (path, exact) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>📚 Admin Panel</h2>
          <p className="admin-name">{admin?.name || 'Administrator'}</p>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path, item.exact) ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
