import React, { Component } from 'react';
import { FiAlertTriangle, FiRefreshCw, FiRotateCcw, FiHome } from 'react-icons/fi';

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 * 
 * Styles are in design-tokens.css (.error-boundary-*)
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // In production, you could send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error tracking (Sentry, LogRocket, etc.)
      // logErrorToService(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <div className="error-boundary-card">
            <div className="error-boundary-icon-wrapper">
              <FiAlertTriangle className="error-boundary-icon" />
            </div>
            <h1 className="error-boundary-title">Something went wrong</h1>
            <p className="error-boundary-message">
              We're sorry, but something unexpected happened. 
              Please try again or return to the home page.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-boundary-details">
                <summary className="error-boundary-summary">Error Details (Development Only)</summary>
                <pre className="error-boundary-pre">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <div className="error-boundary-actions">
              <button onClick={this.handleRetry} className="error-boundary-btn error-boundary-btn-primary">
                <FiRefreshCw /> Try Again
              </button>
              <button onClick={this.handleRefresh} className="error-boundary-btn error-boundary-btn-secondary">
                <FiRotateCcw /> Refresh Page
              </button>
              <button onClick={this.handleGoHome} className="error-boundary-btn error-boundary-btn-outline">
                <FiHome /> Go Home
              </button>
            </div>
            
            {this.state.retryCount > 2 && (
              <p className="error-boundary-help">
                If the problem persists, please try clearing your browser cache 
                or contact support.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
