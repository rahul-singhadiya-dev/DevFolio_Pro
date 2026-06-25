// src/pages/admin/CreateBlogPost.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Save, X, AlertTriangle, ArrowLeft, Eye, Edit3 } from 'lucide-react';
import client from '../../api/client';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { slugify } from '../../utils/slugify';

export const CreateBlogPost = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    published: false,
  });

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState('write'); // 'write' or 'preview'
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

  // Tag list entry keys check (Enter or comma)
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tagText = tagInput.trim().replace(/,/g, '');
      if (tagText && !tags.includes(tagText)) {
        setTags((prev) => [...prev, tagText]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // Form validator check
  const validateForm = () => {
    const tempErrors = {};
    const slugRegex = /^[a-z0-9\-]+$/;

    if (!formData.title.trim()) {
      tempErrors.title = 'Post title is required.';
    }

    if (!formData.slug.trim()) {
      tempErrors.slug = 'Slug is required.';
    } else if (!slugRegex.test(formData.slug)) {
      tempErrors.slug = 'Slug must be lowercase letters, numbers, and hyphens only.';
    }

    if (!formData.excerpt.trim()) {
      tempErrors.excerpt = 'Excerpt is required.';
    } else if (formData.excerpt.length > 160) {
      tempErrors.excerpt = 'Excerpt must be under 160 characters.';
    }

    if (!formData.content.trim()) {
      tempErrors.content = 'Content cannot be empty.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    setSaving(true);
    const postPayload = {
      ...formData,
      tags,
    };

    try {
      const response = await client.post('/admin/blog', postPayload);
      if (response.data && response.data.success) {
        navigate('/admin/blog');
      } else {
        setApiError(response.data.message || 'Failed to publish blog post.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to publish blog post. Verify fields.';
      setApiError(msg);
    } finally {
      setSaving(false);
    }
  };

  const excerptLength = formData.excerpt.length;

  return (
    <div className="animate-fade-in">
      {/* Back Link */}
      <Link to="/admin/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors duration-200">
        <ArrowLeft size={16} /> Back to Blog
      </Link>

      {/* Header */}
      <header className="mb-8 text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">New Post</h1>
        <p className="text-sm text-muted-foreground">Write and publish articles with a markdown editor.</p>
      </header>

      {/* Form Card */}
      <section className="bg-card border border-border rounded-xl p-8 shadow-xs max-w-4xl mb-12 text-left" aria-label="Create blog post form">
        {apiError && (
          <div className="p-4 rounded-md mb-6 text-sm flex items-center gap-3 bg-destructive/10 border border-destructive/20 text-destructive text-left" role="alert">
            <AlertTriangle size={18} />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Title */}
          <Input
            label="Post Title"
            name="title"
            placeholder="E.g. Getting Started with React Router"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            disabled={saving}
            required
          />

          {/* Slug */}
          <Input
            label="Slug"
            name="slug"
            placeholder="getting-started-with-react-router"
            value={formData.slug}
            onChange={handleChange}
            error={errors.slug}
            disabled={saving}
            required
          />
          <div className="text-xs text-muted-foreground mt-[-12px] mb-2 border-l-3 border-amber-500 bg-muted/20 px-3 py-2 rounded-r-md text-left">
            Slug preview: <span className="font-mono text-foreground font-semibold">{formData.slug || 'untitled-post'}</span>
          </div>

          {/* Excerpt with Character Counter */}
          <div className="flex flex-col w-full text-left">
            <div className="flex justify-between w-full">
              <span className="text-xs font-semibold text-foreground tracking-wider uppercase mb-1.5">
                Excerpt (Short summary) <span className="text-destructive">*</span>
              </span>
              <span className={`text-xs ${excerptLength > 160 ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                {excerptLength} / 160 characters
              </span>
            </div>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              disabled={saving}
              placeholder="Provide a quick summary of the article contents for grid card list previews."
              className={`w-full text-sm px-3.5 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 min-h-[70px] mt-2 text-left ${errors.excerpt ? 'border-destructive' : ''}`}
            />
            {errors.excerpt && <span className="text-xs text-destructive font-medium mt-1">{errors.excerpt}</span>}
          </div>

          {/* Tag pills input */}
          <div className="flex flex-col w-full text-left">
            <span className="text-xs font-semibold text-foreground tracking-wider uppercase">Topic Tags</span>
            <div className="flex flex-wrap gap-2 p-2 border border-input rounded-md bg-background min-h-[44px] mt-2">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-muted text-foreground border border-border rounded-md text-xs font-medium">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="bg-transparent border-none cursor-pointer text-muted-foreground hover:text-destructive p-0 flex items-center">
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="Type tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                disabled={saving}
                className="border-none bg-transparent flex-grow min-w-[120px] text-sm text-foreground focus:outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Markdown Split Write/Preview Area */}
          <div className="flex flex-col w-full text-left">
            <span className="text-xs font-semibold text-foreground tracking-wider uppercase mb-2">
              Article Content (Markdown supported) <span className="text-destructive">*</span>
            </span>
            
            {/* Tabs bar */}
            <div className="flex border-b border-border mb-2 gap-2">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium border-b-2 bg-transparent cursor-pointer transition-colors duration-200 ${activeTab === 'write' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveTab('write')}
              >
                <Edit3 size={14} className="mr-1.5 inline-block" /> Write
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium border-b-2 bg-transparent cursor-pointer transition-colors duration-200 ${activeTab === 'preview' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveTab('preview')}
              >
                <Eye size={14} className="mr-1.5 inline-block" /> Preview
              </button>
            </div>

            {/* Write Textarea */}
            {activeTab === 'write' ? (
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                disabled={saving}
                placeholder="# Introduction..."
                className="w-full min-h-[350px] font-mono text-sm p-4 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 resize-vertical text-left leading-relaxed"
              />
            ) : (
              // Markdown render Preview
              <div className="w-full min-h-[350px] p-4 border border-input rounded-md bg-background overflow-y-auto text-left markdown-content">
                {formData.content ? (
                  <ReactMarkdown>{formData.content}</ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground italic">Nothing to preview. Start writing in the Write tab.</p>
                )}
              </div>
            )}
            {errors.content && <span className="text-xs text-destructive font-medium mt-1">{errors.content}</span>}
          </div>

          {/* Published switches */}
          <Input
            label="Publish article immediately"
            name="published"
            type="switch"
            checked={formData.published}
            onChange={(e) => setFormData((prev) => ({ ...prev, published: e.target.checked }))}
            disabled={saving}
          />

          {/* Action buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Link to="/admin/blog">
              <Button variant="outline" disabled={saving}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="primary" loading={saving} disabled={saving}>
              <Save size={16} /> Publish Post
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default CreateBlogPost;

