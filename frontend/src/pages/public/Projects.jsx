// src/pages/public/Projects.jsx
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, FolderKanban, ChevronRight, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFetch } from '../../hooks/useFetch';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import ProjectCard from '../../components/projects/ProjectCard';

export const Projects = () => {
  // Fetch all published projects. We set the limit high (e.g. 100) to get all projects for client-side filtering
  const { data, loading, error, refetch } = useFetch('/projects?limit=100');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState('All');

  const projects = data?.projects || [];

  // Extract all unique tech tags from the project list dynamically
  const uniqueTags = useMemo(() => {
    const tagsSet = new Set(['All']);
    projects.forEach((proj) => {
      if (Array.isArray(proj.techTags)) {
        proj.techTags.forEach((tag) => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet);
  }, [projects]);

  // Client-side search and tag filtering logic
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTag =
        activeTag === 'All' ||
        (Array.isArray(project.techTags) && project.techTags.includes(activeTag));

      return matchesSearch && matchesTag;
    });
  }, [projects, searchTerm, activeTag]);

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
        <h2 className="text-xl font-bold text-destructive">Failed to load projects</h2>
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
        <span className="section-label">04 — Portfolio Showcase</span>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 tracking-tight">My Projects</h1>
        <p className="text-sm text-muted-foreground">
          A collection of things I've built — from side experiments to production systems.
        </p>
      </header>

      {projects.length === 0 ? (
        // Empty State: No projects at all in the database
        <EmptyState
          icon={FolderKanban}
          heading="No projects yet."
          subheading="Check back soon — something's being built."
        />
      ) : (
        <>
          {/* Controls: Search and Filter Pills */}
          <section className="mb-10 flex flex-col md:flex-row gap-4 justify-between md:items-center bg-card border border-border rounded-xl p-6 shadow-xs" aria-label="Filters and Search">
            {/* Tag Pills */}
            <div className="flex flex-col gap-2 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Filter by Tech:</span>
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
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search projects"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
            </div>
          </section>

          {/* Projects Grid Display */}
          <ErrorBoundary>
            {filteredProjects.length === 0 ? (
              // Empty State: Search/filter returned no results
              <EmptyState
                icon={XCircle}
                heading="No projects match your criteria."
                subheading="Try checking your search spelling or clearing filters."
                ctaText="Clear Filters"
                onCtaClick={handleClearFilters}
              />
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProjects.map((project) => (
                    <motion.div
                      key={project.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ProjectCard project={project} />
                    </motion.div>
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

export default Projects;

