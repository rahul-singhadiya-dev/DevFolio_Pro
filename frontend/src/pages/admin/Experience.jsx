// src/pages/admin/Experience.jsx
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Briefcase, Check, AlertTriangle, Save } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import client from '../../api/client';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { formatDuration } from '../../utils/formatDate';

export const Experience = () => {
  // Fetch admin work history entries
  const { data: experiences, loading, error, refetch, setData } = useFetch('/experience');

  // Form Modal States
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null); // null means adding new entry
  const [submittingForm, setSubmittingForm] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // Deletion Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Status Alerts
  const [successMsg, setSuccessMsg] = useState(null);
  const [apiError, setApiError] = useState(null);

  // Helper to extract YYYY-MM-DD from ISO Date string
  const toDateInputString = (isoString) => {
    if (!isoString) return '';
    return isoString.substring(0, 10);
  };

  // Open Form Modal for adding
  const handleAddClick = () => {
    setEditingExperience(null);
    setFormData({
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
    });
    setFormErrors({});
    setFormModalOpen(true);
    setSuccessMsg(null);
    setApiError(null);
  };

  // Open Form Modal for editing
  const handleEditClick = (exp) => {
    setEditingExperience(exp);
    setFormData({
      company: exp.company || '',
      role: exp.role || '',
      startDate: toDateInputString(exp.startDate),
      endDate: toDateInputString(exp.endDate),
      isCurrent: exp.isCurrent || false,
      description: exp.description || '',
    });
    setFormErrors({});
    setFormModalOpen(true);
    setSuccessMsg(null);
    setApiError(null);
  };

  // Open Delete Confirm Modal
  const handleDeleteClick = (exp) => {
    setExperienceToDelete(exp);
    setDeleteModalOpen(true);
    setSuccessMsg(null);
    setApiError(null);
  };

  // Input change handler
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
      // If toggled currently working, clear end date
      if (name === 'isCurrent' && checked) {
        updated.endDate = '';
      }
      return updated;
    });

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Validation rules
  const validateForm = () => {
    const tempErrors = {};
    if (!formData.company.trim()) {
      tempErrors.company = 'Company is required.';
    }
    if (!formData.role.trim()) {
      tempErrors.role = 'Role/Title is required.';
    }
    if (!formData.startDate) {
      tempErrors.startDate = 'Start date must be a valid date.';
    }
    if (!formData.isCurrent && !formData.endDate) {
      tempErrors.endDate = 'End date is required if not currently working.';
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      tempErrors.endDate = 'End date cannot be before start date.';
    }
    if (!formData.description.trim()) {
      tempErrors.description = 'Description achievements are required.';
    }

    setFormErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Form submit handler
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmittingForm(true);

    const payload = {
      ...formData,
      endDate: formData.isCurrent ? null : formData.endDate,
    };

    try {
      if (editingExperience) {
        // Edit PUT `/admin/experience/:id`
        const response = await client.put(`/admin/experience/${editingExperience.id}`, payload);
        if (response.data && response.data.success) {
          setSuccessMsg('Experience entry saved.');
          // Update details locally
          setData((prev) => prev.map((item) => (item.id === editingExperience.id ? response.data.data : item)));
        }
      } else {
        // Create POST `/admin/experience`
        const response = await client.post('/admin/experience', payload);
        if (response.data && response.data.success) {
          setSuccessMsg('Experience entry saved.');
          // Insert details locally
          setData((prev) => [...prev, response.data.data]);
        }
      }
      setFormModalOpen(false);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to save experience history.');
    } finally {
      setSubmittingForm(false);
    }
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!experienceToDelete) return;
    setDeleting(true);
    try {
      const response = await client.delete(`/admin/experience/${experienceToDelete.id}`);
      if (response.status === 200) {
        setSuccessMsg('Experience entry removed.');
        setData((prev) => prev.filter((item) => item.id !== experienceToDelete.id));
      } else {
        setApiError('Could not delete experience. Please try again.');
      }
    } catch (err) {
      setApiError('Could not delete experience. Please try again.');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setExperienceToDelete(null);
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
        <h3 className="text-lg font-semibold text-destructive mb-2">Failed to load experience history</h3>
        <p className="text-sm text-muted-foreground mb-6">{error}</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 text-left">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Work Experience</h1>
          <p className="text-sm text-muted-foreground">CRUD for work history entries.</p>
        </div>
        <Button variant="primary" onClick={handleAddClick}>
          <Plus size={16} /> Add Experience
        </Button>
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

      {/* Experience Table Card */}
      <ErrorBoundary>
        {!experiences || experiences.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            heading="No experience entries added."
            subheading="Add your work history to display it on the portfolio."
            ctaText="Add Your First Entry"
            onCtaClick={handleAddClick}
          />
        ) : (
          <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden mb-12 w-full text-left">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm" aria-label="Work experience management list">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-4 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Company</th>
                    <th className="p-4 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Role</th>
                    <th className="p-4 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Duration</th>
                    <th className="p-4 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-28">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {experiences.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)).map((exp) => (
                    <tr key={exp.id} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                      <td className="p-4 px-6 font-semibold text-foreground">{exp.company}</td>
                      <td className="p-4 px-6 text-foreground">{exp.role}</td>
                      <td className="p-4 px-6 text-muted-foreground">{formatDuration(exp.startDate, exp.endDate, exp.isCurrent)}</td>
                      <td className="p-4 px-6">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => handleEditClick(exp)}
                            className="p-1 min-h-[36px] w-9 flex items-center justify-center"
                            aria-label="Edit experience"
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handleDeleteClick(exp)}
                            className="p-1 min-h-[36px] w-9 flex items-center justify-center text-destructive hover:text-destructive"
                            aria-label="Delete experience"
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

      {/* Add / Edit Experience Modal */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingExperience ? 'Edit Experience' : 'Add Experience'}
        footer={
          <>
            <Button variant="outline" onClick={() => setFormModalOpen(false)} disabled={submittingForm}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleFormSubmit} loading={submittingForm} disabled={submittingForm}>
              <Save size={16} /> Save Experience
            </Button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 text-left">
          <Input
            label="Company"
            name="company"
            placeholder="TechCorp Solutions"
            value={formData.company}
            onChange={handleFormChange}
            error={formErrors.company}
            disabled={submittingForm}
            required
          />

          <Input
            label="Role / Title"
            name="role"
            placeholder="Senior Full-Stack Engineer"
            value={formData.role}
            onChange={handleFormChange}
            error={formErrors.role}
            disabled={submittingForm}
            required
          />

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <Input
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleFormChange}
              error={formErrors.startDate}
              disabled={submittingForm}
              required
            />

            <Input
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleFormChange}
              error={formErrors.endDate}
              disabled={submittingForm || formData.isCurrent}
              required={!formData.isCurrent}
            />
          </div>

          <Input
            label="I currently work here"
            name="isCurrent"
            type="switch"
            checked={formData.isCurrent}
            onChange={handleFormChange}
            disabled={submittingForm}
          />

          <Input
            label="Description (Key achievements, bullet points)"
            name="description"
            type="textarea"
            placeholder="Architected database schema...&#10;Lead a team of 4..."
            value={formData.description}
            onChange={handleFormChange}
            error={formErrors.description}
            disabled={submittingForm}
            rows={5}
            required
          />
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Experience Entry"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} loading={deleting} disabled={deleting}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 text-left">
          Delete this work entry for <strong>{experienceToDelete?.company}</strong>?
        </p>
      </Modal>
    </div>
  );
};

export default Experience;
