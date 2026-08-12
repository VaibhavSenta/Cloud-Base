/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import React from 'react';

/**
 * ErrorBoundary - Isolates component crashes so one broken section
 * doesn't take down the entire page.
 * 
 * Usage:
 *   <ErrorBoundary fallback={<p>Something went wrong.</p>}>
 *     <SomeComponent />
 *   </ErrorBoundary>
 * 
 * Or with section name:
 *   <ErrorBoundary section="Dashboard Stats">
 *     <StatCard />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to console in development
    console.error(`[ErrorBoundary${this.props.section ? `: ${this.props.section}` : ''}]`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div style={{
          padding: '24px',
          background: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.15)',
          borderRadius: '16px',
          textAlign: 'center',
        }}>
          <p style={{ 
            color: '#ef4444', 
            fontSize: '14px', 
            fontWeight: 600, 
            margin: '0 0 8px 0' 
          }}>
            {this.props.section 
              ? `${this.props.section} failed to load.` 
              : 'This section encountered an error.'}
          </p>
          <p style={{ 
            color: '#869397', 
            fontSize: '12px', 
            margin: '0 0 16px 0' 
          }}>
            The rest of the application is unaffected.
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              background: 'transparent',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              padding: '8px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
