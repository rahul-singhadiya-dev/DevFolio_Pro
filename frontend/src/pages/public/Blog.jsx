// src/pages/public/Blog.jsx
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, BookOpen, ChevronRight, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFetch } from '../../hooks/useFetch';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { formatDate } from '../../utils/formatDate';

export const Blog = () => {
  const navigate = useNavigate();
  // Fetch published blog posts
  const { data, loading, error, refetch } = useFetch('/blog?limit=100');

  const handleCardClick = (slug, e) => {
    // If the click is inside a Link or Button element, let them handle it
    if (e.target.closest('a') || e.target.closest('button')) {
      return;
    }
    // Allow modifier keys (Cmd/Ctrl/Shift) for opening links in a new tab/window
    if (e.metaKey || e.ctrlKey || e.shiftKey) {
      return;
    }
    navigate(`/blog/${slug}`);
  };

  const handleKeyDown = (slug, e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (document.activeElement && document.activeElement.tagName === 'A') {
        return;
      }
      e.preventDefault();
      navigate(`/blog/${slug}`);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState('All');

  const posts = data?.posts || [];

  // Extract all unique tags dynamically
  const uniqueTags = useMemo(() => {
    const tagsSet = new Set(['All']);
    posts.forEach((post) => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach((tag) => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet);
  }, [posts]);

  // Client-side search and tag filtering logic
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.content && post.content.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesTag =
        activeTag === 'All' ||
        (Array.isArray(post.tags) && post.tags.includes(activeTag));

      return matchesSearch && matchesTag;
    });
  }, [posts, searchTerm, activeTag]);

  // Helper to calculate reading time
  const getReadingTime = (content) => {
    if (!content) return 1;
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-16 text-center">
        <h2 className="text-xl font-bold text-destructive">Failed to load blog posts</h2>
        <p className="my-4 text-sm text-muted-foreground">{error}</p>
        <button
          type="button"
          onClick={refetch}
          className="px-4 py-2 bg-foreground text-background font-medium rounded-md hover:opacity-90 cursor-pointer transition-opacity"
        >
          Retry
        </button>
      </div>
    );
  }

  const handleClearFilters = () => {
    setSearchTerm('');
    setActiveTag('All');
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 md:px-8">
      {/* Page Header */}
      <header className="text-center max-w-[600px] mx-auto py-12">
        <span className="section-label">05 — Articles & Writings</span>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 tracking-tight">Thoughts & Writings</h1>
        <p className="text-sm text-muted-foreground">
          I write about web development, software architecture, and lessons learned building real products.
        </p>
      </header>

      {posts.length === 0 ? (
        // Empty State: No posts in DB
        <EmptyState
          icon={BookOpen}
          heading="Nothing published yet."
          subheading="Stay tuned for upcoming articles."
        />
      ) : (
        <>
          {/* Controls: Search and Tag Pills */}
          <section className="mb-10 flex flex-col md:flex-row gap-4 justify-between md:items-center bg-card border border-border rounded-xl p-6 shadow-xs" aria-label="Filters and Search">
            {/* Tag Pills */}
            <div className="flex flex-col gap-2 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Browse by Topic:</span>
              <div className="flex flex-wrap gap-2">
                {uniqueTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`px-2.5 py-1 text-[10px] font-mono font-medium rounded-sm border uppercase transition-all duration-200 cursor-pointer ${
                      activeTag === tag
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-card text-muted-foreground border-border hover:border-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setActiveTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:max-w-xs text-left">
              <input
                type="text"
                className="w-full pl-4 pr-10 py-2 border border-input rounded-md text-sm bg-background text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-ring focus:border-ring outline-none transition-all duration-200"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search articles"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
            </div>
          </section>

          {/* Blog Roll Listing */}
          <ErrorBoundary>
            {filteredPosts.length === 0 ? (
              // Empty State: Search returned no results
              <EmptyState
                icon={XCircle}
                heading="No articles match your query."
                subheading="Try typing a different keyword or checking filters."
                ctaText="Clear Filters"
                onCtaClick={handleClearFilters}
              />
            ) : (
              <motion.div
                layout
                className="flex flex-col gap-6 mb-16 max-w-3xl mx-auto text-left"
              >
                <AnimatePresence mode="popLayout">
                  {filteredPosts.map((post) => (
                    <motion.article
                      key={post.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className="bg-card border border-border rounded-xl p-6 shadow-xs hover:border-muted-foreground/30 hover:-translate-y-1 hover:shadow-sm transition-all duration-300 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={(e) => handleCardClick(post.slug, e)}
                      onKeyDown={(e) => handleKeyDown(post.slug, e)}
                      tabIndex={0}
                      role="button"
                      aria-label={`Read article ${post.title}`}
                    >
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <time dateTime={post.createdAt}>{formatDate(post.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}</time>
                        <span>•</span>
                        <span>{getReadingTime(post.content)} min read</span>
                      </div>

                      <h2 className="text-xl font-bold text-foreground mb-2 leading-snug">
                        <Link to={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                          {post.title}
                        </Link>
                      </h2>
                      
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{post.excerpt}</p>

                      <div className="flex justify-between items-center flex-wrap gap-2 pt-2 border-t border-border/50">
                        <div className="flex gap-2">
                          {post.tags?.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Link to={`/blog/${post.slug}`} className="text-sm font-semibold text-foreground hover:text-primary inline-flex items-center gap-1 transition-colors duration-200">
                          Read Article <ChevronRight size={14} />
                        </Link>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </ErrorBoundary>
        </>
      )}
    </div>
  );
};

export default Blog;

