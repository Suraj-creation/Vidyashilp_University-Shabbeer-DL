import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
const FeedbackManager = lazy(() => import('./pages/admin/FeedbackManager'));

// Protected Route Component for Admin
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="protected-loading"><div>Loading...</div></div>;
  }

  return isAuthenticated ? children : <Navigate to="/admin/login" />;
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
              
              {/* Course Content - Public */}
              <Route path="/lectures" element={
                <ErrorBoundary>
                  <LecturesPage />
                </ErrorBoundary>
              } />
              {/* Redirect old curriculum route to lectures */}
              <Route path="/curriculum" element={<Navigate to="/lectures" replace />} />
              <Route path="/assignments" element={
                <ErrorBoundary>
                  <AssignmentsPage />
                </ErrorBoundary>
              } />
              <Route path="/tutorials" element={
                <ErrorBoundary>
                  <TutorialsPage />
                </ErrorBoundary>
              } />
              <Route path="/exams" element={
                <ErrorBoundary>
                <ExamsPage />
                </ErrorBoundary>
              } />
              <Route path="/prerequisites" element={
                <ErrorBoundary>
                  <PrerequisitesPage />
                </ErrorBoundary>
              } />
              <Route path="/resources" element={
                <ErrorBoundary>
                  <ResourcesPage />
                </ErrorBoundary>
              } />


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
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
