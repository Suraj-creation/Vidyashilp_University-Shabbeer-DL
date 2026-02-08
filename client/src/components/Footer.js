import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon">DL</div>
              <div className="footer-logo-text">
                <span className="brand-name">DATA302</span>
                <span className="brand-sub">Deep Learning</span>
              </div>
            </div>
            <p className="footer-description">
              School of Engineering and Technology (SET), Vidyashilp University, Bengaluru. 
              Course effective from January 8, 2026.
            </p>
            <div className="footer-instructor">
              <p style={{fontSize: '0.9rem', marginTop: '12px'}}>
                <strong>Instructor:</strong> Dr. Shabbeer Basha
              </p>

            </div>
          </div>

          {/* Course Navigation */}
          <div className="footer-links">
            <h4>Course Content</h4>
            <ul>
              <li><Link to="/lectures">Lectures</Link></li>
              <li><Link to="/assignments">Assignments</Link></li>
              <li><Link to="/tutorials">Lab Programs</Link></li>
              <li><Link to="/resources">Resources</Link></li>
            </ul>
          </div>

          {/* Course Info */}
          <div className="footer-links">
            <h4>Course Info</h4>
            <ul>
              <li><Link to="/prerequisites">Prerequisites</Link></li>
              <li><Link to="/exams">Exam Schedule</Link></li>
              <li>
                <Link to="/admin/login" className="admin-link">
                  <FaShieldAlt /> Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Primary Textbooks */}
          <div className="footer-resources">
            <h4>Primary Textbooks</h4>
            <div className="textbook-list">
              <p style={{fontSize: '0.85rem', marginBottom: '8px', lineHeight: '1.5'}}>
                <strong>Deep Learning</strong><br />
                <span style={{color: '#b0b0b0'}}>Bengio, Goodfellow & Courville (MIT Press, 2017)</span>
              </p>
              <p style={{fontSize: '0.85rem', lineHeight: '1.5'}}>
                <strong>Dive into Deep Learning</strong><br />
                <span style={{color: '#b0b0b0'}}>Zhang, Lipton, Li & Smola (Cambridge, 2023)</span>
              </p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} DATA302 Deep Learning Course • Vidyashilp University
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
