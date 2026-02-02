import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStudentAuth } from '../../context/StudentAuthContext';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { student, loading, isAuthenticated, logout } = useStudentAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/student/login');
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/student/login');
  };

  return (
    <div className="student-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🎓 DL Course Platform</h1>
          <div className="header-actions">
            <Link to="/student/profile" className="profile-link">
              <img src={student.avatar} alt={student.name} className="avatar" />
              <span>{student.name}</span>
            </Link>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Welcome Section */}
          <section className="welcome-section">
            <h2>Welcome back, {student.name}! 👋</h2>
            <p className="subtitle">Ready to continue your learning journey?</p>
            
            {!student.isEmailVerified && (
              <div className="verification-banner">
                <span>⚠️ Please verify your email to access all features</span>
                <button className="verify-btn">Resend Verification Email</button>
              </div>
            )}
          </section>

          {/* Stats Cards */}
          <section className="stats-section">
            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-info">
                <h3>{student.enrolledCourses?.length || 0}</h3>
                <p>Enrolled Courses</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>0</h3>
                <p>Completed</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <h3>0</h3>
                <p>In Progress</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-info">
                <h3>0%</h3>
                <p>Avg Progress</p>
              </div>
            </div>
          </section>

          {/* Enrolled Courses */}
          <section className="courses-section">
            <div className="section-header">
              <h3>My Courses</h3>
              <Link to="/courses" className="view-all-link">
                Browse Courses →
              </Link>
            </div>
            
            {student.enrolledCourses && student.enrolledCourses.length > 0 ? (
              <div className="courses-grid">
                {student.enrolledCourses.map((enrollment) => (
                  <div key={enrollment._id} className="course-card">
                    <div className="course-thumbnail">
                      <img 
                        src={enrollment.course?.thumbnail || 'https://via.placeholder.com/300x150'} 
                        alt={enrollment.course?.title} 
                      />
                    </div>
                    <div className="course-info">
                      <h4>{enrollment.course?.title}</h4>
                      <p>{enrollment.course?.description}</p>
                      <div className="course-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${enrollment.progress}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">{enrollment.progress}% Complete</span>
                      </div>
                      <button className="continue-btn">Continue Learning</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h4>No courses enrolled yet</h4>
                <p>Start your learning journey by enrolling in a course!</p>
                <Link to="/courses" className="browse-btn">
                  Browse Courses
                </Link>
              </div>
            )}
          </section>

          {/* Quick Links */}
          <section className="quick-links-section">
            <h3>Quick Links</h3>
            <div className="quick-links-grid">
              <Link to="/courses" className="quick-link-card">
                <span className="link-icon">📚</span>
                <span className="link-text">All Courses</span>
              </Link>
              <Link to="/student/profile" className="quick-link-card">
                <span className="link-icon">👤</span>
                <span className="link-text">My Profile</span>
              </Link>
              <Link to="/resources" className="quick-link-card">
                <span className="link-icon">📁</span>
                <span className="link-text">Resources</span>
              </Link>
              <Link to="/teaching-team" className="quick-link-card">
                <span className="link-icon">👥</span>
                <span className="link-text">Teaching Team</span>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
