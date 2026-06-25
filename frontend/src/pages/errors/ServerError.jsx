// src/pages/errors/ServerError.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';
import Button from '../../components/common/Button';

export const ServerError = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <main style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      padding: '2rem'
    }} aria-label="Server Error page">
      <div style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '3rem 2rem',
        boxShadow: 'var(--shadow-md)',
        maxWidth: '500px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          color: 'var(--color-error)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <AlertOctagon size={40} />
        </div>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: '0.5rem' }}>500 — Something Went Wrong</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)' }}>
            There's an issue on our end. Please try refreshing or come back shortly.
          </p>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: '0.5rem', display: 'block' }}>
            If this keeps happening, please contact the site owner.
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="primary" onClick={handleRefresh}>
            <RefreshCw size={16} /> Refresh Page
          </Button>
          <Link to="/">
            <Button variant="outline">
              <Home size={16} /> Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default ServerError;
