// src/pages/admin/CreateProject.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Save, X, AlertTriangle, ArrowLeft } from 'lucide-react';
import client from '../../api/client';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { slugify } from '../../utils/slugify';

export const CreateProject = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    shortDescription: '',
    fullDescription: '',
    liveUrl: '',
    githubUrl: '',
    thumbnailUrl: '',
    published: false,
  });

  const [techTags, setTechTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isSlugManual, setIsSlugManual] = useState(false);

  // Auto-generate slug from title (if not edited manually)
  useEffect(() => {
    if (!isSlugManual) {
      setFormData((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [formData.title, isSlugManual]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (name === 'slug') {
      setIsSlugManual(true);
    }
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Tag pill input keydown events (Enter or comma to add tag)
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tagText = tagInput.trim().replace(/,/g, '');
      if (tagText && !techTags.includes(tagText)) {
        setTechTags((prev) => [...prev, tagText]);
      }
      setTagInput('');
      if (errors.techTags) {
        setErrors((prev) => ({ ...prev, techTags: null }));
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTechTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // Client validation checks
  const validateForm = () => {
    const tempErrors = {};
    const urlRegex = /^https?:\/\/.+/i;
    const slugRegex = /^[a-z0-9\-]+$/;

    if (!formData.title.trim()) {
      tempErrors.title = 'Title is required.';
    }

    if (!formData.slug.trim()) {
      tempErrors.slug = 'Slug is required.';
    } else if (!slugRegex.test(formData.slug)) {
      tempErrors.slug = 'Slug must be lowercase letters, numbers, and hyphens only.';
    }

    if (!formData.shortDescription.trim()) {
      tempErrors.shortDescription = 'Short description is required.';
    }

    if (!formData.fullDescription.trim()) {
      tempErrors.fullDescription = 'Full description is required.';
    }

    if (techTags.length === 0) {
      tempErrors.techTags = 'At least one tech tag is required.';
    }

    const checkUrl = (field, label) => {
      if (formData[field].trim() && !urlRegex.test(formData[field])) {
        tempErrors[field] = `${label} must be a valid URL starting with http:// or https://`;
      }
    };

    checkUrl('liveUrl', 'Live Demo URL');
    checkUrl('githubUrl', 'GitHub Source URL');
    checkUrl('thumbnailUrl', 'Thumbnail URL');

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    setSaving(true);
    
    const projectPayload = {
      ...formData,
      techTags,
    };

    try {
      const response = await client.post('/admin/projects', projectPayload);
      if (response.data && response.data.success) {
        navigate('/admin/projects');
      } else {
        setApiError(response.data.message || 'Failed to create project.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create project. Please verify data.';
      setApiError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Back Link */}
      <Link to="/admin/projects" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors duration-200">
        <ArrowLeft size={16} /> Back to Projects
      </Link>

      {/* Header */}
      <header className="mb-8 text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">New Project</h1>
        <p className="text-sm text-muted-foreground">Form to add a new project to your portfolio.</p>
      </header>

      {/* Form Card */}
      <section className="bg-card border border-border rounded-xl p-8 shadow-xs max-w-3xl mb-12 text-left" aria-label="Create project form">
        {apiError && (
          <div className="p-4 rounded-md mb-6 text-sm flex items-center gap-3 bg-destructive/10 border border-destructive/20 text-destructive text-left" role="alert">
            <AlertTriangle size={18} />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Title */}
          <Input
            label="Project Title"
            name="title"
            placeholder="E.g. E-Commerce Platform"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            disabled={saving}
            required
          />

          {/* Slug */}
          <Input
            label="URL Slug"
            name="slug"
            placeholder="e-commerce-platform"
            value={formData.slug}
            onChange={handleChange}
            error={errors.slug}
            disabled={saving}
            required
          />
          <div className="text-xs text-muted-foreground mt-[-12px] mb-2 border-l-3 border-amber-500 bg-muted/20 px-3 py-2 rounded-r-md flex flex-col gap-1 text-left">
            <span>
              Slug preview: <span className="font-mono text-foreground font-semibold">{formData.slug || 'untitled-project'}</span>
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-500 font-medium">
              Changing the slug will break existing links to this project.
            </span>
          </div>

          {/* Short Description */}
          <Input
            label="Short Description"
            name="shortDescription"
            placeholder="A brief 1-2 sentence overview of the project"
            value={formData.shortDescription}
            onChange={handleChange}
            error={errors.shortDescription}
            disabled={saving}
            required
          />

          {/* Full Description (Markdown) */}
          <Input
            label="Full Description (Markdown supported)"
            name="fullDescription"
            type="textarea"
            placeholder="Write a detailed description here. You can explain features, architecture, and design challenges."
            value={formData.fullDescription}
            onChange={handleChange}
            error={errors.fullDescription}
            disabled={saving}
            rows={10}
            required
          />

          {/* Tech stack pills custom input */}
          <div className="flex flex-col w-full text-left">
            <label htmlFor="tagInput" className="text-xs font-semibold text-foreground tracking-wider uppercase mb-1.5">
              Tech Tags <span className="text-destructive">*</span>
            </label>
            <div className={`flex flex-wrap gap-2 p-2 border rounded-md bg-background min-h-[44px] ${errors.techTags ? 'border-destructive' : 'border-input'}`}>
              {techTags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-muted text-foreground border border-border rounded-md text-xs font-medium">
                  {tag}
                  <button
                    type="button"
                    className="bg-transparent border-none cursor-pointer text-muted-foreground hover:text-destructive p-0 flex items-center"
                    onClick={() => handleRemoveTag(tag)}
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                id="tagInput"
                type="text"
                placeholder="Type tag and press Enter"
                className="border-none bg-transparent flex-grow min-w-[120px] text-sm text-foreground focus:outline-none placeholder:text-muted-foreground"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                disabled={saving}
              />
            </div>
            {errors.techTags && <span className="text-xs text-destructive font-medium mt-1">{errors.techTags}</span>}
          </div>

          {/* URLs row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Live Demo Link"
              name="liveUrl"
              placeholder="https://myproject.com"
              value={formData.liveUrl}
              onChange={handleChange}
              error={errors.liveUrl}
              disabled={saving}
            />
            <Input
              label="GitHub Source Link"
              name="githubUrl"
              placeholder="https://github.com/username/project"
              value={formData.githubUrl}
              onChange={handleChange}
              error={errors.githubUrl}
              disabled={saving}
            />
          </div>

          {/* Thumbnail URL */}
          <Input
            label="Thumbnail Image URL"
            name="thumbnailUrl"
            placeholder="https://images.unsplash.com/photo-..."
            value={formData.thumbnailUrl}
            onChange={handleChange}
            error={errors.thumbnailUrl}
            disabled={saving}
          />

          {/* Published state */}
          <Input
            label="Publish project immediately"
            name="published"
            type="switch"
            checked={formData.published}
            onChange={(e) => setFormData((prev) => ({ ...prev, published: e.target.checked }))}
            disabled={saving}
          />

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Link to="/admin/projects">
              <Button variant="outline" disabled={saving}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="primary" loading={saving} disabled={saving}>
              <Save size={16} /> Create Project
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default CreateProject;

