import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudentAuthProvider, useStudentAuth } from './context/StudentAuthContext';
import { ToastProvider, ConfirmProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';

import './App.css';
import FeedbackWidget from './components/FeedbackWidget/FeedbackWidget';

// =====================================================
// Lazy-loaded Route Components (Code Splitting)
// Each route loads its own JS chunk on demand
// =====================================================

// Public Pages
const HomePage = lazy(() => import('./pages/public/HomePage'));
const LecturesPage = lazy(() => import('./pages/public/LecturesPage'));
const AssignmentsPage = lazy(() => import('./pages/public/AssignmentsPage'));
const ResourcesPage = lazy(() => import('./pages/public/ResourcesPage'));
const TutorialsPage = lazy(() => import('./pages/public/TutorialsPage'));
const ExamsPage = lazy(() => import('./pages/public/ExamsPage'));
const PrerequisitesPage = lazy(() => import('./pages/public/PrerequisitesPage'));

// Student Auth Pages
const StudentLogin = lazy(() => import('./pages/student/StudentLogin'));
const StudentRegister = lazy(() => import('./pages/student/StudentRegister'));
const GoogleCallback = lazy(() => import('./pages/student/GoogleCallback'));

// Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const CourseManager = lazy(() => import('./pages/admin/CourseManager'));
const LectureManager = lazy(() => import('./pages/admin/LectureManager'));
const AssignmentManager = lazy(() => import('./pages/admin/AssignmentManager'));
const TutorialManager = lazy(() => import('./pages/admin/TutorialManager'));
const PrerequisiteManager = lazy(() => import('./pages/admin/PrerequisiteManager'));
const ExamManager = lazy(() => import('./pages/admin/ExamManager'));
const ResourceManager = lazy(() => import('./pages/admin/ResourceManager'));
const UserManager = lazy(() => import('./pages/admin/UserManager'));
const FeedbackManager = lazy(() => import('./pages/admin/FeedbackManager'));

// Protected Route Component for Admin
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="protected-loading"><div>Loading...</div></div>;
  }

  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};

// Protected Route Component for Students (Public Course Content)
const ProtectedStudentRoute = ({ children }) => {
  const { isAuthenticated, loading } = useStudentAuth();

  if (loading) {
    return <div className="protected-loading protected-loading-dark"><div>Loading...</div></div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Suspense fallback for lazy-loaded routes
const PageLoader = () => (
  <div className="page-loader">
    <div style={{ textAlign: 'center' }}>
      <div className="page-loader-spinner" />
      <div className="page-loader-text">Loading...</div>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <StudentAuthProvider>
          <ToastProvider>
            <ConfirmProvider>
              <Router>
                <Suspense fallback={<PageLoader />}>
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
                <Route path="feedback" element={<FeedbackManager />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<div>Page Not Found</div>} />
            </Routes>
            <FeedbackWidget />
            </Suspense>
              </Router>
            </ConfirmProvider>
          </ToastProvider>
        </StudentAuthProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
