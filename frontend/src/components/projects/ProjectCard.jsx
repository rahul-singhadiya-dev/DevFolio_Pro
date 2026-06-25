// src/components/projects/ProjectCard.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FolderKanban, ChevronRight, Eye, ExternalLink, Calendar } from 'lucide-react';
import { Github } from '../common/BrandIcons';
import Badge from '../common/Badge';

/**
 * Completely Redesigned Premium Project Card Component styled with Tailwind CSS
 * @param {object} props
 * @param {object} props.project - Project model details
 */
export const ProjectCard = ({ project }) => {
  const { title, slug, shortDescription, techTags, thumbnailUrl, viewCount, githubUrl, liveUrl, createdAt } = project;
  const navigate = useNavigate();

  // Format view count (e.g. 1.2k views)
  const formatViews = (views) => {
    if (!views) return '0';
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views;
  };

  // Get project year
  const projectYear = createdAt ? new Date(createdAt).getFullYear() : null;

  // Navigate to project details, unless quick actions or modifier clicks are triggered
  const handleCardClick = (e) => {
    // If the click is inside quickActions or custom action links, let them handle themselves
    if (e.target.closest('[data-quick-actions]') || e.target.closest('a[target="_blank"]')) {
      return;
    }
    // Allow modifier keys (Cmd/Ctrl/Shift) for opening links in a new tab/window
    if (e.metaKey || e.ctrlKey || e.shiftKey) {
      return;
    }
    navigate(`/projects/${slug}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // If focus is currently on a target="_blank" quick link, let the browser execute it
      if (document.activeElement && document.activeElement.getAttribute('target') === '_blank') {
        return;
      }
      e.preventDefault();
      navigate(`/projects/${slug}`);
    }
  };

  return (
    <article
      className="group relative flex flex-col h-full bg-card/30 backdrop-blur-md border border-border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01] hover:border-muted-foreground/30 hover:shadow-md hover:shadow-primary/5 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring text-left"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for project ${title}`}
    >
      {/* Thumbnail Container */}
      <div className="relative w-full aspect-[16/10] overflow-hidden border-b border-border bg-muted/20">
        {/* Link wrapping only the image/fallback */}
        <Link to={`/projects/${slug}`} className="block w-full h-full" aria-label={`View details for ${title}`} tabIndex={-1}>
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 text-muted-foreground font-mono text-[9px] uppercase tracking-wider gap-2">
              <FolderKanban size={40} className="text-muted opacity-80 group-hover:scale-105 transition-transform duration-500" />
              <span>Project Archive</span>
            </div>
          )}
        </Link>

        {/* Floating Badges Overlay (Views & Timeline) */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10 pointer-events-none">
          <div className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-xs text-white rounded-full px-2 py-0.5 text-[10px] font-mono shadow-sm" title={`${viewCount} views`}>
            <Eye size={12} className="shrink-0" />
            <span>{formatViews(viewCount)}</span>
          </div>
          {projectYear && (
            <div className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-xs text-white rounded-full px-2 py-0.5 text-[10px] font-mono shadow-sm" title={`Published in ${projectYear}`}>
              <Calendar size={11} className="shrink-0" />
              <span>{projectYear}</span>
            </div>
          )}
        </div>

        {/* Interactive Hover Actions Overlay */}
        {(githubUrl || liveUrl) && (
          <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" data-quick-actions>
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all shadow-sm cursor-pointer"
                title="View Code on GitHub"
                onClick={(e) => e.stopPropagation()}
              >
                <Github size={16} />
              </a>
            )}
            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all shadow-sm cursor-pointer"
                title="View Live Demo"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-grow p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1.5">
          <Link to={`/projects/${slug}`} className="hover:text-primary transition-colors">
            {title}
          </Link>
        </h3>
        <p className="text-xs text-muted-foreground mb-4 line-clamp-3 leading-relaxed flex-grow">{shortDescription}</p>

        {/* Custom Premium Tech Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {techTags?.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] font-medium bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-sm border border-border/50 hover:bg-primary/10 hover:text-primary transition-colors">
              {tag}
            </span>
          ))}
          {techTags?.length > 3 && (
            <Badge variant="muted" className="h-5 text-[10px] rounded-sm">
              +{techTags.length - 3}
            </Badge>
          )}
        </div>

        {/* Interactive Action Link */}
        <div className="mt-auto pt-3 border-t border-border/50">
          <Link to={`/projects/${slug}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-primary transition-colors">
            <span>Explore Project</span>
            <div className="w-4 h-4 rounded-full flex items-center justify-center bg-muted text-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:translate-x-1 transition-all duration-300">
              <ChevronRight size={12} />
            </div>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;
