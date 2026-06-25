// src/pages/admin/Messages.jsx
import React, { useState } from 'react';
import { Mail, Trash2, Eye, Check, AlertTriangle, CheckSquare } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import client from '../../api/client';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { formatDate } from '../../utils/formatDate';

export const Messages = () => {
  // Fetch admin inbox contact messages
  const { data: messages, loading, error, refetch, setData } = useFetch('/admin/messages');

  // Modal View States
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [activeMessage, setActiveMessage] = useState(null);

  // Modal Delete Confirm States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Status Alerts
  const [successMsg, setSuccessMsg] = useState(null);
  const [apiError, setApiError] = useState(null);

  // View message and mark it read automatically
  const handleViewClick = async (message) => {
    setActiveMessage(message);
    setViewModalOpen(true);
    setSuccessMsg(null);
    setApiError(null);

    // If message is unread, trigger PUT `/admin/messages/:id` to mark it read
    if (!message.isRead) {
      try {
        const response = await client.put(`/admin/messages/${message.id}`);
        if (response.data && response.data.success) {
          // Update local state list
          setData((prev) => prev.map((m) => (m.id === message.id ? { ...m, isRead: true } : m)));
          // Update active message modal view
          setActiveMessage((prev) => ({ ...prev, isRead: true }));
        }
      } catch (err) {
        console.error('Failed to mark message as read:', err);
      }
    }
  };

  // Explicit mark as read action
  const handleMarkReadClick = async (message, e) => {
    e.stopPropagation(); // prevent opening view modal
    setSuccessMsg(null);
    setApiError(null);
    try {
      const response = await client.put(`/admin/messages/${message.id}`);
      if (response.data && response.data.success) {
        setSuccessMsg('Message marked as read.');
        setData((prev) => prev.map((m) => (m.id === message.id ? { ...m, isRead: true } : m)));
      }
    } catch (err) {
      setApiError('Failed to mark message read.');
    }
  };

  // Open delete confirm modal
  const handleDeleteClick = (message, e) => {
    e.stopPropagation(); // prevent opening view modal
    setMessageToDelete(message);
    setDeleteModalOpen(true);
    setSuccessMsg(null);
    setApiError(null);
  };

  // Confirm delete message request
  const handleConfirmDelete = async () => {
    if (!messageToDelete) return;
    setDeleting(true);
    try {
      const response = await client.delete(`/admin/messages/${messageToDelete.id}`);
      if (response.status === 200) {
        setSuccessMsg('Message deleted successfully.');
        setData((prev) => prev.filter((m) => m.id !== messageToDelete.id));
        // If the deleted message is currently opened in view modal, close it
        if (activeMessage && activeMessage.id === messageToDelete.id) {
          setViewModalOpen(false);
          setActiveMessage(null);
        }
      } else {
        setApiError('Could not delete message. Please try again.');
      }
    } catch (err) {
      setApiError('Could not delete message. Please try again.');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setMessageToDelete(null);
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
        <h3 className="text-lg font-semibold text-destructive mb-2">Failed to load messages inbox</h3>
        <p className="text-sm text-muted-foreground mb-6">{error}</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header Container */}
      <div className="mb-8 text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Messages</h1>
        <p className="text-sm text-muted-foreground">Contact form submissions from visitors.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-lg mb-6 text-sm flex items-center gap-3 max-w-[800px] text-left" role="status">
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {apiError && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg mb-6 text-sm flex items-center gap-3 max-w-[800px] text-left" role="alert">
          <AlertTriangle size={18} />
          <span>{apiError}</span>
        </div>
      )}

      {/* Messages list table */}
      <ErrorBoundary>
        {!messages || messages.length === 0 ? (
          <EmptyState
            icon={Mail}
            heading="Your inbox is empty."
            subheading="Contact form submissions from visitors will appear here."
          />
        ) : (
          <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden mb-12 w-full text-left">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm" aria-label="Messages inbox list">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-4 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">From</th>
                    <th className="p-4 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Subject</th>
                    <th className="p-4 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                    <th className="p-4 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="p-4 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-36">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((msg) => (
                    <tr
                      key={msg.id}
                      className={`border-b border-border last:border-0 hover:bg-muted/10 transition-colors cursor-pointer ${!msg.isRead ? 'font-bold bg-primary/5' : ''}`}
                      onClick={() => handleViewClick(msg)}
                    >
                      <td className="p-4 px-6 text-foreground flex items-center min-h-[53px]">
                        {!msg.isRead && <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2" />}
                        <span>{msg.name}</span>
                      </td>
                      <td className="p-4 px-6 text-foreground">{msg.subject}</td>
                      <td className="p-4 px-6 text-muted-foreground">{formatDate(msg.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="p-4 px-6">
                        {msg.isRead ? (
                          <Badge variant="muted">Read</Badge>
                        ) : (
                          <Badge variant="warning">Unread</Badge>
                        )}
                      </td>
                      <td className="p-4 px-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => handleViewClick(msg)}
                            className="p-1 min-h-[36px] w-9 flex items-center justify-center"
                            aria-label="View message"
                          >
                            <Eye size={14} />
                          </Button>
                          {!msg.isRead && (
                            <Button
                              variant="ghost"
                              onClick={(e) => handleMarkReadClick(msg, e)}
                              className="p-1 min-h-[36px] w-9 flex items-center justify-center text-emerald-600 hover:text-emerald-600"
                              aria-label="Mark message read"
                            >
                              <CheckSquare size={14} />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            onClick={(e) => handleDeleteClick(msg, e)}
                            className="p-1 min-h-[36px] w-9 flex items-center justify-center text-destructive hover:text-destructive"
                            aria-label="Delete message"
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

      {/* Message viewer Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Message Details"
        footer={
          <>
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Close
            </Button>
            <Button
              variant="danger"
              onClick={(e) => {
                setViewModalOpen(false);
                handleDeleteClick(activeMessage, e);
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        {activeMessage && (
          <div className="flex flex-col gap-3 text-sm text-left">
            <div className="grid grid-cols-[80px_1fr] pb-2 border-b border-border">
              <span className="font-bold text-muted-foreground">From:</span>
              <span className="text-foreground">{activeMessage.name} &lt;{activeMessage.email}&gt;</span>
            </div>
            <div className="grid grid-cols-[80px_1fr] pb-2 border-b border-border">
              <span className="font-bold text-muted-foreground">Subject:</span>
              <span className="text-foreground">{activeMessage.subject}</span>
            </div>
            <div className="grid grid-cols-[80px_1fr] pb-2 border-b border-border">
              <span className="font-bold text-muted-foreground">Received:</span>
              <span className="text-foreground">
                {new Date(activeMessage.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="pb-0 pt-2">
              <span className="font-bold text-muted-foreground">Message:</span>
            </div>
            <div className="mt-2 bg-muted/30 p-4 rounded-md border border-border text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {activeMessage.message}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Message"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} loading={deleting} disabled={deleting}>
              Delete Message
            </Button>
          </>
        }
      >
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 text-left">
          Delete this message permanently?
        </p>
      </Modal>
    </div>
  );
};

export default Messages;
