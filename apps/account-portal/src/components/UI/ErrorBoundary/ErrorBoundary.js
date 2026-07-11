'use client';

import React from 'react';

/**
 * ErrorBoundary - Isolates component crashes so one broken section
 * doesn't take down the entire page.
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
    console.error(`[ErrorBoundary${this.props.section ? `: ${this.props.section}` : ''}]`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '24px',
          background: 'rgba(255, 69, 58, 0.05)',
          border: '1px solid rgba(255, 69, 58, 0.15)',
          borderRadius: '16px',
          textAlign: 'center',
        }}>
          <p style={{ 
            color: '#ff453a', 
            fontSize: '14px', 
            fontWeight: 600, 
            margin: '0 0 8px 0',
            fontFamily: 'Inter, sans-serif'
          }}>
            {this.props.section 
              ? `${this.props.section} failed to load.` 
              : 'This section encountered an error.'}
          </p>
          <p style={{ 
            color: '#86868b', 
            fontSize: '12px', 
            margin: '0 0 16px 0',
            fontFamily: 'Inter, sans-serif'
          }}>
            The rest of the application is unaffected.
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 69, 58, 0.3)',
              color: '#ff453a',
              padding: '8px 20px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              transition: 'all 0.2s ease'
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
