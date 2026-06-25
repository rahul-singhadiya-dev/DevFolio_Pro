// src/components/common/ErrorBoundary.jsx
import React from 'react';
import Button from './Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{
          padding: '2rem',
          border: '1px solid var(--color-error)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'rgba(239, 68, 68, 0.05)',
          textAlign: 'center',
          margin: '1rem 0'
        }}>
          <h4 style={{ color: 'var(--color-error)', marginBottom: '0.5rem' }}>Oops, something broke.</h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
            An unexpected error occurred in this section.
          </p>
          <Button variant="outline" onClick={this.handleRetry}>
            Try Again
          </Button>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '0.5rem' }}>
            The rest of the page is still available.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
