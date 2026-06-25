// src/pages/public/Resume.jsx
import React from 'react';
import { Download, FileText } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatDate';

export const Resume = () => {
  // Fetch developer profile to extract the resume PDF file path
  const { data: profile, loading, error } = useFetch('/profile');

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Get full backend server URL for static uploads (if path starts with /uploads)
  const getFullResumeUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const serverRootUrl = apiBaseUrl.replace('/api', '');
    return `${serverRootUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const resumeUrl = getFullResumeUrl(profile?.resumeUrl);

  const handleDownload = () => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank');
    }
  };

  const updatedDate = profile?.updatedAt
    ? formatDate(profile.updatedAt, { month: 'long', year: 'numeric' })
    : 'January 2025';

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 md:px-8">
      {/* Header */}
      <header className="text-center max-w-[600px] mx-auto py-12">
        <span className="section-label">03 — Resume Summary</span>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 tracking-tight">My Resume</h1>
        <p className="text-sm text-muted-foreground mb-2">
          A summary of my experience, education, and technical skills.
        </p>
        <p className="text-[11px] font-mono text-muted-foreground/80">Last updated: {updatedDate}</p>
      </header>

      {!profile?.resumeUrl ? (
        // Empty State: No resume uploaded
        <EmptyState
          icon={FileText}
          heading="Resume not available."
          subheading="The developer hasn't uploaded a resume PDF copy yet."
        />
      ) : (
        <>
          {/* Actions Bar */}
          <div className="flex justify-center mb-8">
            <div className="relative group/tooltip">
              <Button variant="primary" onClick={handleDownload}>
                <Download size={16} /> Download PDF
              </Button>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-popover text-popover-foreground border border-border text-[10px] rounded shadow-md pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 text-center">
                Downloads the latest version of my resume.
              </span>
            </div>
          </div>

          {/* PDF Viewer Frame */}
          <div className="w-full max-w-[900px] mx-auto border border-border rounded-xl bg-card overflow-hidden shadow-sm aspect-[3/4] mb-12">
            <object
              data={resumeUrl}
              type="application/pdf"
              className="w-full h-full border-none"
              aria-label="PDF Resume Viewer"
            >
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-card">
                <FileText size={48} className="text-muted-foreground/60 mb-4" />
                <p className="text-xs text-muted-foreground max-w-xs mb-6 leading-relaxed">
                  PDF preview not available in your browser. Please download the document directly to view it.
                </p>
                <Button variant="outline" onClick={handleDownload}>
                  <Download size={16} /> Download PDF
                </Button>
              </div>
            </object>
          </div>
        </>
      )}
    </div>
  );
};

export default Resume;
