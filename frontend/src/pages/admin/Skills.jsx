// src/pages/admin/Skills.jsx
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Award, Check, AlertTriangle, Save } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import client from '../../api/client';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import ErrorBoundary from '../../components/common/ErrorBoundary';

export const Skills = () => {
  // Fetch admin skills list
  const { data: skills, loading, error, refetch, setData } = useFetch('/admin/skills');

  // Form Modal States
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null); // null means adding new skill
  const [submittingForm, setSubmittingForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'FRONTEND',
    proficiency: 'INTERMEDIATE',
    sortOrder: 0,
  });
  const [formErrors, setFormErrors] = useState({});

  // Deletion Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Status Alerts
  const [successMsg, setSuccessMsg] = useState(null);
  const [apiError, setApiError] = useState(null);

  const categoryOptions = [
    { value: 'FRONTEND', label: 'Frontend' },
    { value: 'BACKEND', label: 'Backend' },
    { value: 'DATABASE', label: 'Database' },
    { value: 'DEVOPS', label: 'DevOps' },
    { value: 'TOOLS', label: 'Tools' },
  ];

  const proficiencyOptions = [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
    { value: 'EXPERT', label: 'Expert' },
  ];

  // Open Form Modal for adding
  const handleAddClick = () => {
    setEditingSkill(null);
    setFormData({
      name: '',
      category: 'FRONTEND',
      proficiency: 'INTERMEDIATE',
      sortOrder: skills ? skills.length : 0,
    });
    setFormErrors({});
    setFormModalOpen(true);
    setSuccessMsg(null);
    setApiError(null);
  };

  // Open Form Modal for editing
  const handleEditClick = (skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name || '',
      category: skill.category || 'FRONTEND',
      proficiency: skill.proficiency || 'INTERMEDIATE',
      sortOrder: skill.sortOrder || 0,
    });
    setFormErrors({});
    setFormModalOpen(true);
    setSuccessMsg(null);
    setApiError(null);
  };

  // Open Delete Confirm Modal
  const handleDeleteClick = (skill) => {
    setSkillToDelete(skill);
    setDeleteModalOpen(true);
    setSuccessMsg(null);
    setApiError(null);
  };

  // Form Input Change Handler
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'sortOrder' ? parseInt(value, 10) || 0 : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Form validation rules
  const validateForm = () => {
    const tempErrors = {};
    if (!formData.name.trim()) {
      tempErrors.name = 'Skill name is required.';
    }
    setFormErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Submit Skill addition/modification
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmittingForm(true);

    try {
      if (editingSkill) {
        // Edit Skill PUT `/admin/skills/:id`
        const response = await client.put(`/admin/skills/${editingSkill.id}`, formData);
        if (response.data && response.data.success) {
          setSuccessMsg('Skill saved.');
          // Update details locally
          setData((prev) => prev.map((s) => (s.id === editingSkill.id ? response.data.data : s)));
        }
      } else {
        // Add Skill POST `/admin/skills`
        const response = await client.post('/admin/skills', formData);
        if (response.data && response.data.success) {
          setSuccessMsg('Skill saved.');
          // Insert details locally
          setData((prev) => [...prev, response.data.data]);
        }
      }
      setFormModalOpen(false);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to save skill details.');
    } finally {
      setSubmittingForm(false);
    }
  };

  // Confirm deletion action
  const handleConfirmDelete = async () => {
    if (!skillToDelete) return;
    setDeleting(true);
    try {
      const response = await client.delete(`/admin/skills/${skillToDelete.id}`);
      if (response.status === 200) {
        setSuccessMsg('Skill removed.');
        setData((prev) => prev.filter((s) => s.id !== skillToDelete.id));
      } else {
        setApiError('Could not delete skill. Please try again.');
      }
    } catch (err) {
      setApiError('Could not delete skill. Please try again.');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setSkillToDelete(null);
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
        <h3 className="text-lg font-semibold text-destructive mb-2">Failed to load skills list</h3>
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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Skills</h1>
          <p className="text-sm text-muted-foreground">Add, edit, reorder, or delete skills by category.</p>
        </div>
        <Button variant="primary" onClick={handleAddClick}>
          <Plus size={16} /> Add Skill
        </Button>
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

      {/* Skills Table Card */}
      <ErrorBoundary>
        {!skills || skills.length === 0 ? (
          <EmptyState
            icon={Award}
            heading="No skills added yet."
            subheading="Add your technical skills to display them on the portfolio."
            ctaText="Add Your First Skill"
            onCtaClick={handleAddClick}
          />
        ) : (
          <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden mb-12 w-full text-left">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm" aria-label="Skills inventory management list">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="text-muted-foreground font-bold uppercase text-[10px] font-mono tracking-wider px-6 py-4 border-b border-border">Skill Name</th>
                    <th className="text-muted-foreground font-bold uppercase text-[10px] font-mono tracking-wider px-6 py-4 border-b border-border">Category</th>
                    <th className="text-muted-foreground font-bold uppercase text-[10px] font-mono tracking-wider px-6 py-4 border-b border-border">Proficiency</th>
                    <th className="text-muted-foreground font-bold uppercase text-[10px] font-mono tracking-wider px-6 py-4 border-b border-border">Sort Order</th>
                    <th className="text-muted-foreground font-bold uppercase text-[10px] font-mono tracking-wider px-6 py-4 border-b border-border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {skills.sort((a, b) => a.sortOrder - b.sortOrder).map((skill) => (
                    <tr key={skill.id} className="hover:bg-muted/10 transition-colors duration-150">
                      <td className="px-6 py-4 border-b border-border font-semibold text-foreground">{skill.name}</td>
                      <td className="px-6 py-4 border-b border-border align-middle">
                        <Badge variant="secondary">
                          {skill.category.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 border-b border-border align-middle">
                        <Badge variant={skill.proficiency === 'EXPERT' || skill.proficiency === 'ADVANCED' ? 'primary' : 'muted'}>
                          {skill.proficiency.toLowerCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 border-b border-border align-middle">{skill.sortOrder}</td>
                      <td className="px-6 py-4 border-b border-border align-middle">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => handleEditClick(skill)}
                            className="h-9 w-9 p-0 flex items-center justify-center"
                            aria-label="Edit skill"
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handleDeleteClick(skill)}
                            className="h-9 w-9 p-0 flex items-center justify-center text-destructive hover:text-destructive"
                            aria-label="Delete skill"
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

      {/* Add / Edit Skill Modal */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingSkill ? 'Edit Skill' : 'Add New Skill'}
        footer={
          <>
            <Button variant="outline" onClick={() => setFormModalOpen(false)} disabled={submittingForm}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleFormSubmit} loading={submittingForm} disabled={submittingForm}>
              <Save size={16} /> Save Skill
            </Button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 text-left">
          <Input
            label="Skill Name"
            name="name"
            placeholder="E.g. React"
            value={formData.name}
            onChange={handleFormChange}
            error={formErrors.name}
            disabled={submittingForm}
            required
          />

          <Input
            label="Category"
            name="category"
            type="select"
            options={categoryOptions}
            value={formData.category}
            onChange={handleFormChange}
            disabled={submittingForm}
          />

          <Input
            label="Proficiency Level"
            name="proficiency"
            type="select"
            options={proficiencyOptions}
            value={formData.proficiency}
            onChange={handleFormChange}
            disabled={submittingForm}
          />

          <Input
            label="Sort Order"
            name="sortOrder"
            type="number"
            placeholder="0"
            value={formData.sortOrder}
            onChange={handleFormChange}
            disabled={submittingForm}
          />
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Remove Skill"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} loading={deleting} disabled={deleting}>
              Remove
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Remove this skill (<strong>{skillToDelete?.name}</strong>) from your portfolio?
        </p>
      </Modal>
    </div>
  );
};

export default Skills;

