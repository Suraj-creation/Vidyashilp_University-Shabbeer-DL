import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudentAuthProvider, useStudentAuth } from './context/StudentAuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Public Pages
import HomePage from './pages/public/HomePage';
import LecturesPage from './pages/public/LecturesPage';
import AssignmentsPage from './pages/public/AssignmentsPage';
import ResourcesPage from './pages/public/ResourcesPage';
import TutorialsPage from './pages/public/TutorialsPage';
import ExamsPage from './pages/public/ExamsPage';
import PrerequisitesPage from './pages/public/PrerequisitesPage';

// Student Auth Pages
import StudentLogin from './pages/student/StudentLogin';
import StudentRegister from './pages/student/StudentRegister';
import GoogleCallback from './pages/student/GoogleCallback';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLayout from './components/AdminLayout';
import CourseManager from './pages/admin/CourseManager';
import LectureManager from './pages/admin/LectureManager';
import AssignmentManager from './pages/admin/AssignmentManager';
import TutorialManager from './pages/admin/TutorialManager';
import PrerequisiteManager from './pages/admin/PrerequisiteManager';
import ExamManager from './pages/admin/ExamManager';
import ResourceManager from './pages/admin/ResourceManager';
import UserManager from './pages/admin/UserManager';

import './App.css';

// Protected Route Component for Admin
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};

// Protected Route Component for Students (Public Course Content)
const ProtectedStudentRoute = ({ children }) => {
  const { isAuthenticated, loading } = useStudentAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, #0f0a1f 0%, #1a1035 50%, #0d1b2a 100%)' }}>
        <div style={{ color: '#a78bfa', fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <StudentAuthProvider>
          <Router>
            <Routes>
              {/* Public Routes - Only Home page is public */}
              <Route path="/" element={
                <ErrorBoundary>
                  <HomePage />
                </ErrorBoundary>
              } />
              
              {/* Protected Course Content - Requires Student Login */}
              <Route path="/lectures" element={
                <ProtectedStudentRoute>
                  <ErrorBoundary>
                    <LecturesPage />
                  </ErrorBoundary>
                </ProtectedStudentRoute>
              } />
              {/* Redirect old curriculum route to lectures */}
              <Route path="/curriculum" element={<Navigate to="/lectures" replace />} />
              <Route path="/assignments" element={
                <ProtectedStudentRoute>
                  <ErrorBoundary>
                    <AssignmentsPage />
                  </ErrorBoundary>
                </ProtectedStudentRoute>
              } />
              <Route path="/tutorials" element={
                <ProtectedStudentRoute>
                  <ErrorBoundary>
                    <TutorialsPage />
                  </ErrorBoundary>
                </ProtectedStudentRoute>
              } />
              <Route path="/exams" element={
                <ProtectedStudentRoute>
                  <ErrorBoundary>
                    <ExamsPage />
                  </ErrorBoundary>
                </ProtectedStudentRoute>
              } />
              <Route path="/prerequisites" element={
                <ProtectedStudentRoute>
                  <ErrorBoundary>
                    <PrerequisitesPage />
                  </ErrorBoundary>
                </ProtectedStudentRoute>
              } />
              <Route path="/resources" element={
                <ProtectedStudentRoute>
                  <ErrorBoundary>
                    <ResourcesPage />
                  </ErrorBoundary>
                </ProtectedStudentRoute>
              } />

              {/* Student Auth Routes */}
              <Route path="/login" element={
                <ErrorBoundary>
                  <StudentLogin />
                </ErrorBoundary>
              } />
              <Route path="/register" element={
                <ErrorBoundary>
                  <StudentRegister />
                </ErrorBoundary>
              } />
              {/* Legacy routes redirect */}
              <Route path="/student/login" element={<Navigate to="/login" replace />} />
              <Route path="/student/register" element={<Navigate to="/register" replace />} />
              <Route path="/auth/google/callback" element={
                <ErrorBoundary>
                  <GoogleCallback />
                </ErrorBoundary>
              } />
              {/* Dashboard redirects to home - no separate dashboard page */}
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/student/dashboard" element={<Navigate to="/" replace />} />

              {/* Admin Login */}
              <Route path="/admin/login" element={
                <ErrorBoundary>
                  <AdminLogin />
                </ErrorBoundary>
              } />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <AdminLayout />
                    </ErrorBoundary>
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="courses" element={<CourseManager />} />
                <Route path="lectures" element={<LectureManager />} />
                <Route path="assignments" element={<AssignmentManager />} />
                <Route path="tutorials" element={<TutorialManager />} />
                <Route path="prerequisites" element={<PrerequisiteManager />} />
                <Route path="exams" element={<ExamManager />} />
                <Route path="resources" element={<ResourceManager />} />
                <Route path="users" element={<UserManager />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<div>Page Not Found</div>} />
            </Routes>
          </Router>
        </StudentAuthProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
