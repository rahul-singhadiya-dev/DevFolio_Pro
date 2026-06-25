// src/pages/public/ProjectDetail.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, ExternalLink, Eye, FolderKanban, ChevronRight } from 'lucide-react';
import { Github } from '../../components/common/BrandIcons';
import { useFetch } from '../../hooks/useFetch';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import ProjectCard from '../../components/projects/ProjectCard';

export const ProjectDetail = () => {
  const { slug } = useParams();

  // Fetch the project data. Note that this endpoint atomically increments views on GET in the backend.
  const { data: project, loading, error } = useFetch(`/projects/${slug}`);

  // Fetch some other projects for the "More Projects" section
  const { data: relatedData } = useFetch('/projects?limit=4');

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-24 text-center">
        <h2 className="text-2xl font-bold text-destructive">Project Not Found</h2>
        <p className="my-6 text-sm text-muted-foreground">
          {error || "This project couldn't be loaded. It may have been removed."}
        </p>
        <Link to="/projects">
          <Button variant="primary">
            <ArrowLeft size={16} /> Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  // Filter out the current project from the "More Projects" grid
  const relatedProjects = (relatedData?.projects || [])
    .filter((p) => p.slug !== project.slug)
    .slice(0, 3);

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 md:px-8">
      {/* Back Link */}
      <Link to="/projects" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium mt-8 mb-6 transition-colors duration-200">
        <ArrowLeft size={16} />
        <span>Back to Projects</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[2.5fr_1fr] gap-10 mb-16 text-left">
        {/* Main Details Area */}
        <div className="flex flex-col">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground tracking-tight">{project.title}</h1>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-1" aria-label={`${project.viewCount} views`}>
              <Eye size={16} />
              <span>{project.viewCount} views</span>
            </span>
            <span>•</span>
            <span>Published on {new Date(project.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="w-full max-h-[450px] rounded-xl overflow-hidden border border-border mb-8 bg-card shadow-xs">
            {project.thumbnailUrl ? (
              <img src={project.thumbnailUrl} alt={project.title} className="w-full h-full object-cover" />
            ) : (
              <div className="h-[350px] flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 text-muted-foreground">
                <FolderKanban size={64} />
              </div>
            )}
          </div>

          <div className="markdown-content">
            <ErrorBoundary>
              <ReactMarkdown>{project.fullDescription}</ReactMarkdown>
            </ErrorBoundary>
          </div>
        </div>

        {/* Sidebar Info Area */}
        <aside className="flex flex-col gap-6" aria-label="Project Meta Info">
          {/* Tech stack list */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {project.techTags?.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Links widget */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Project Links</h3>
            <div className="flex flex-col gap-3">
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" className="w-full justify-center">
                    Visit Live Site <ExternalLink size={16} />
                  </Button>
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full justify-center">
                    View on GitHub <Github size={16} />
                  </Button>
                </a>
              )}
              {!project.liveUrl && !project.githubUrl && (
                <p className="text-xs text-muted-foreground">
                  No links available for this project.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* More Projects Section */}
      {relatedProjects.length > 0 && (
        <section className="border-t border-border pt-12 mb-16 text-left" aria-label="More Projects">
          <h2 className="text-2xl font-bold mb-8 text-center text-foreground">More Projects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {relatedProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProjectDetail;

