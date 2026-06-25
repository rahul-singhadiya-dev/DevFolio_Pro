// src/pages/errors/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Home, FolderKanban } from 'lucide-react';
import Button from '../../components/common/Button';

export const NotFound = () => {
  return (
    <main style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      padding: '2rem'
    }} aria-label="Page Not Found">
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
          backgroundColor: 'rgba(217, 119, 6, 0.08)',
          color: 'var(--color-warning)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <HelpCircle size={40} />
        </div>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: '0.5rem' }}>404 — Page Not Found</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)' }}>
            Looks like this page doesn't exist or has been moved.
          </p>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: '0.5rem', display: 'block' }}>
            Lost in the void.
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/">
            <Button variant="primary">
              <Home size={16} /> Back to Home
            </Button>
          </Link>
          <Link to="/projects">
            <Button variant="outline">
              <FolderKanban size={16} /> View Projects
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
