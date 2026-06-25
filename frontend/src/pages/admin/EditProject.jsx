// src/pages/admin/EditProject.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Save, X, AlertTriangle, ArrowLeft } from 'lucide-react';
import client from '../../api/client';
import { useFetch } from '../../hooks/useFetch';
import Spinner from '../../components/common/Spinner';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const EditProject = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch all admin projects to locate our specific project by ID
  const { data: projects, loading, error, refetch } = useFetch('/admin/projects');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    shortDescription: '',
    fullDescription: '',
    liveUrl: '',
    githubUrl: '',
    thumbnailUrl: '',
    published: false,
    viewCount: 0,
  });

  const [techTags, setTechTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isSlugManual, setIsSlugManual] = useState(false);

  // Sync selected project into form fields on fetch completion
  useEffect(() => {
    if (projects) {
      const project = projects.find((p) => p.id === id);
      if (project) {
        setFormData({
          title: project.title || '',
          slug: project.slug || '',
          shortDescription: project.shortDescription || '',
          fullDescription: project.fullDescription || '',
          liveUrl: project.liveUrl || '',
          githubUrl: project.githubUrl || '',
          thumbnailUrl: project.thumbnailUrl || '',
          published: project.published || false,
          viewCount: project.viewCount || 0,
        });
        setTechTags(project.techTags || []);
      }
    }
  }, [projects, id]);

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
      tempErrors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens.';
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
      const response = await client.put(`/admin/projects/${id}`, projectPayload);
      if (response.data && response.data.success) {
        navigate('/admin/projects');
      } else {
        setApiError(response.data.message || 'Failed to update project.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update project.';
      setApiError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  // If after load, projects are fetched but this ID is not matched
  const projectExists = projects?.some((p) => p.id === id);
  if (error || !projectExists) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-24 text-center">
        <h2 className="text-2xl font-bold text-destructive">Project Not Found</h2>
        <p className="my-6 text-sm text-muted-foreground">The requested project details could not be retrieved.</p>
        <Link to="/admin/projects">
          <Button variant="primary">Back to Projects</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Back Link */}
      <Link to="/admin/projects" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors duration-200">
        <ArrowLeft size={16} /> Back to Projects
      </Link>

      {/* Header */}
      <header className="mb-8 text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Edit Project</h1>
        <p className="text-sm text-muted-foreground">Pre-filled form to update an existing project.</p>
      </header>

      {/* Form Card */}
      <section className="bg-card border border-border rounded-xl p-8 shadow-xs max-w-3xl mb-12 text-left" aria-label="Edit project form">
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
              Slug preview: <span className="font-mono text-foreground font-semibold">{formData.slug}</span>
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
            placeholder="Write a detailed description here..."
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

          {/* Views count display and option to edit / reset */}
          <div className="max-w-[200px]">
            <Input
              label="Reset View Counter"
              name="viewCount"
              type="number"
              value={formData.viewCount}
              onChange={(e) => setFormData((prev) => ({ ...prev, viewCount: parseInt(e.target.value, 10) || 0 }))}
              disabled={saving}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Link to="/admin/projects">
              <Button variant="outline" disabled={saving}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="primary" loading={saving} disabled={saving}>
              <Save size={16} /> Update Project
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default EditProject;

