// src/pages/admin/Blog.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, BookOpen, Check, AlertTriangle, ToggleLeft, ToggleRight, Eye } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import client from '../../api/client';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { formatDate } from '../../utils/formatDate';

export const Blog = () => {
  // Fetch all posts (both published and drafts)
  const { data: posts, loading, error, refetch, setData } = useFetch('/admin/blog');

  // Deletion Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Status Alerts
  const [successMsg, setSuccessMsg] = useState(null);
  const [apiError, setApiError] = useState(null);

  // Toggle publish/draft status handler
  const handleToggleStatus = async (post) => {
    setSuccessMsg(null);
    setApiError(null);
    const updatedStatus = !post.published;

    try {
      const response = await client.put(`/admin/blog/${post.id}`, {
        ...post,
        published: updatedStatus,
      });

      if (response.data && response.data.success) {
        setSuccessMsg('Post status updated.');
        // Update local state list
        setData((prev) => prev.map((p) => (p.id === post.id ? response.data.data : p)));
      } else {
        setApiError('Could not update status. Please try again.');
      }
    } catch (err) {
      setApiError('Could not update status. Please try again.');
    }
  };

  // Open confirm delete modal
  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setDeleteModalOpen(true);
    setSuccessMsg(null);
    setApiError(null);
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    setDeleting(true);
    try {
      const response = await client.delete(`/admin/blog/${postToDelete.id}`);
      if (response.status === 200) {
        setSuccessMsg('Post deleted.');
        setData((prev) => prev.filter((p) => p.id !== postToDelete.id));
      } else {
        setApiError('Could not delete post. Please try again.');
      }
    } catch (err) {
      setApiError('Could not delete post. Please try again.');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setPostToDelete(null);
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
        <h3 className="text-lg font-semibold text-destructive mb-2">Failed to load blog posts</h3>
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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Blog Posts</h1>
          <p className="text-sm text-muted-foreground">List all posts with published/draft status toggle.</p>
        </div>
        <Link to="/admin/blog/new">
          <Button variant="primary">
            <Plus size={16} /> Write New Post
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

      {/* Blog List Table */}
      <ErrorBoundary>
        {!posts || posts.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            heading="Nothing published yet."
            subheading="Articles and tutorials will show up here once published."
            ctaText="Write Your First Post"
            onCtaClick={() => window.location.hash = '#/admin/blog/new'}
          />
        ) : (
          <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden mb-12 w-full text-left">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm" aria-label="Blog posts management list">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="text-muted-foreground font-bold uppercase text-[10px] font-mono tracking-wider px-6 py-4 border-b border-border">Title</th>
                    <th className="text-muted-foreground font-bold uppercase text-[10px] font-mono tracking-wider px-6 py-4 border-b border-border">Status</th>
                    <th className="text-muted-foreground font-bold uppercase text-[10px] font-mono tracking-wider px-6 py-4 border-b border-border">Date</th>
                    <th className="text-muted-foreground font-bold uppercase text-[10px] font-mono tracking-wider px-6 py-4 border-b border-border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-muted/10 transition-colors duration-150">
                      <td className="px-6 py-4 border-b border-border font-semibold text-foreground">
                        <Link to={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-primary transition-colors">
                          {post.title} <Eye size={12} className="text-muted-foreground" />
                        </Link>
                      </td>
                      <td className="px-6 py-4 border-b border-border align-middle">
                        {post.published ? (
                          <Badge variant="success">Published</Badge>
                        ) : (
                          <Badge variant="muted">Draft</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 border-b border-border align-middle">{formatDate(post.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="px-6 py-4 border-b border-border align-middle">
                        <div className="flex gap-2 items-center">
                          {/* Toggle Status switch */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(post)}
                            className="bg-transparent border-none cursor-pointer flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200"
                            style={{ color: post.published ? 'var(--color-primary)' : 'var(--color-muted)' }}
                            aria-label={post.published ? 'Change to Draft' : 'Change to Publish'}
                          >
                            {post.published ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                          </button>
                          
                          <Link to={`/admin/blog/${post.id}/edit`}>
                            <Button variant="ghost" className="h-9 w-9 p-0 flex items-center justify-center" aria-label="Edit post">
                              <Edit2 size={14} />
                            </Button>
                          </Link>
                          
                          <Button
                            variant="ghost"
                            onClick={() => handleDeleteClick(post)}
                            className="h-9 w-9 p-0 flex items-center justify-center text-destructive hover:text-destructive"
                            aria-label="Delete post"
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

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Blog Post"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} loading={deleting} disabled={deleting}>
              Delete Post
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Permanently delete this post (<strong>{postToDelete?.title}</strong>)? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default Blog;

