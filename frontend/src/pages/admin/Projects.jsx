// src/pages/admin/Projects.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, FolderKanban, Check, AlertTriangle } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import client from '../../api/client';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import ErrorBoundary from '../../components/common/ErrorBoundary';

export const Projects = () => {
  // Fetch all projects (both published and drafts)
  const { data: projects, loading, error, refetch, setData } = useFetch('/admin/projects');

  // Deletion Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Status Alerts
  const [successMsg, setSuccessMsg] = useState(null);
  const [apiError, setApiError] = useState(null);

  // Trigger deletion confirmation modal
  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setDeleteModalOpen(true);
    setSuccessMsg(null);
    setApiError(null);
  };

  // Perform project deletion request
  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setDeleting(true);
    try {
      const response = await client.delete(`/admin/projects/${projectToDelete.id}`);
      if (response.status === 200) {
        setSuccessMsg("Project deleted successfully.");
        // Update state locally
        setData((prev) => prev.filter((p) => p.id !== projectToDelete.id));
      } else {
        setApiError("Could not delete project. Please try again.");
      }
    } catch (err) {
      setApiError("Could not delete project. Please try again.");
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setProjectToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 border border-destructive rounded-xl text-center bg-destructive/5 max-w-lg mx-auto my-12">
        <AlertTriangle size={36} className="text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-destructive mb-2">Failed to load projects list</h3>
        <p className="text-sm text-muted-foreground mb-6">{error}</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header Container */}
      <div className="flex justify-between items-center mb-8 text-left">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Projects</h1>
          <p className="text-sm text-muted-foreground">List all projects with edit/delete actions.</p>
        </div>
        <Link to="/admin/projects/new">
          <Button variant="primary">
            <Plus size={16} /> Add New Project
          </Button>
        </Link>
      </div>

      {successMsg && (
        <div className="p-4 rounded-md mb-6 text-sm flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 max-w-3xl text-left" role="status">
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {apiError && (
        <div className="p-4 rounded-md mb-6 text-sm flex items-center gap-3 bg-destructive/10 border border-destructive/20 text-destructive max-w-3xl text-left" role="alert">
          <AlertTriangle size={18} />
          <span>{apiError}</span>
        </div>
      )}

      {/* Projects Table Card */}
      <ErrorBoundary>
        {!projects || projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            heading="No projects yet."
            subheading="Projects you add will appear here."
            ctaText="Add Your First Project"
            onCtaClick={() => window.location.hash = '#/admin/projects/new'} // redirect via router trigger
          />
        ) : (
          <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden mb-12 w-full text-left">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm" aria-label="Projects management list">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="text-muted-foreground font-bold uppercase text-[10px] font-mono tracking-wider px-6 py-4 border-b border-border">Title</th>
                    <th className="text-muted-foreground font-bold uppercase text-[10px] font-mono tracking-wider px-6 py-4 border-b border-border">Tech Tags</th>
                    <th className="text-muted-foreground font-bold uppercase text-[10px] font-mono tracking-wider px-6 py-4 border-b border-border">Views</th>
                    <th className="text-muted-foreground font-bold uppercase text-[10px] font-mono tracking-wider px-6 py-4 border-b border-border">Status</th>
                    <th className="text-muted-foreground font-bold uppercase text-[10px] font-mono tracking-wider px-6 py-4 border-b border-border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-muted/10 transition-colors duration-150">
                      <td className="px-6 py-4 border-b border-border font-semibold text-foreground">{project.title}</td>
                      <td className="px-6 py-4 border-b border-border">
                        <div className="flex gap-1.5 flex-wrap max-w-xs">
                          {project.techTags?.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                          {project.techTags?.length > 3 && (
                            <Badge variant="muted">+{project.techTags.length - 3}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 border-b border-border align-middle">
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Eye size={14} />
                          {project.viewCount || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-b border-border align-middle">
                        {project.published ? (
                          <Badge variant="success">Published</Badge>
                        ) : (
                          <Badge variant="muted">Draft</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 border-b border-border align-middle">
                        <div className="flex gap-2">
                          <Link to={`/admin/projects/${project.id}/edit`}>
                            <Button variant="ghost" className="h-9 w-9 p-0 flex items-center justify-center" aria-label="Edit project">
                              <Edit2 size={14} />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            onClick={() => handleDeleteClick(project)}
                            className="h-9 w-9 p-0 flex items-center justify-center text-destructive hover:text-destructive"
                            aria-label="Delete project"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </ErrorBoundary>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Project"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} loading={deleting} disabled={deleting}>
              Delete Project
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Are you sure you want to delete <strong>{projectToDelete?.title}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default Projects;

