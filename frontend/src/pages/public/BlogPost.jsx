// src/pages/public/BlogPost.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Share2, User, Calendar, BookOpen } from 'lucide-react';
import { Twitter, Linkedin } from '../../components/common/BrandIcons';
import { useFetch } from '../../hooks/useFetch';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { formatDate } from '../../utils/formatDate';
import { resolveAssetUrl } from '../../utils/assets';

export const BlogPost = () => {
  const { slug } = useParams();

  // Fetch the individual blog post details
  const { data: post, loading, error } = useFetch(`/blog/${slug}`);

  // Fetch developer profile for author bio card
  const { data: profile } = useFetch('/profile');

  // Handle sharing button events
  const handleShare = (platform) => {
    const pageUrl = encodeURIComponent(window.location.href);
    const postTitle = encodeURIComponent(post?.title || 'Check out this article');
    
    let shareUrl = '';
    if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${postTitle}`;
    } else if (platform === 'linkedin') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

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

  if (error || !post) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-24 text-center">
        <h2 className="text-2xl font-bold text-destructive">Article Not Found</h2>
        <p className="my-6 text-sm text-muted-foreground">
          {error || "This article couldn't be found or may no longer be available."}
        </p>
        <Link to="/blog">
          <Button variant="primary">
            <ArrowLeft size={16} /> Back to Blog
          </Button>
        </Link>
      </div>
    );
  }

  const authorName = profile?.fullName || 'Alex Carter';
  const authorTitle = profile?.title || 'Full-Stack Developer';

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 md:px-8">
      {/* Back Link */}
      <Link to="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium mt-8 mb-6 transition-colors duration-200">
        <ArrowLeft size={16} />
        <span>Back to Blog</span>
      </Link>

      {/* Article Sheet */}
      <article className="max-w-3xl mx-auto mb-16 bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-xs text-left">
        <h1 className="text-2xl sm:text-4xl font-bold mb-4 text-foreground leading-tight tracking-tight">{post.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 border-b border-border pb-4">
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            <time dateTime={post.createdAt}>{formatDate(post.createdAt, { day: 'numeric', month: 'long', year: 'numeric' })}</time>
          </span>
          <span>•</span>
          <span>{getReadingTime(post.content)} min read</span>
          
          <div className="flex gap-2 flex-wrap sm:ml-auto">
            {post.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Content body */}
        <div className="markdown-content mb-10">
          <ErrorBoundary>
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </ErrorBoundary>
        </div>

        {/* End of article widgets */}
        <div className="border-t border-border pt-8 mt-8 flex flex-col gap-6">
          {/* Share buttons */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Enjoyed this article? Share it:</span>
            <div className="flex gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium border border-border rounded-md bg-background text-foreground hover:bg-muted cursor-pointer transition-colors duration-200"
                onClick={() => handleShare('twitter')}
                aria-label="Share on Twitter"
              >
                <Twitter size={14} />
                <span>Twitter</span>
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium border border-border rounded-md bg-background text-foreground hover:bg-muted cursor-pointer transition-colors duration-200"
                onClick={() => handleShare('linkedin')}
                aria-label="Share on LinkedIn"
              >
                <Linkedin size={14} />
                <span>LinkedIn</span>
              </button>
            </div>
          </div>

          {/* Author Box */}
          <div className="flex items-center gap-4 bg-muted/20 border border-border rounded-xl p-5">
            {profile?.avatarUrl ? (
              <img src={resolveAssetUrl(profile.avatarUrl)} alt={authorName} className="w-12 h-12 rounded-full object-cover border border-border" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center text-muted-foreground">
                <User size={24} />
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-sm text-foreground">Written by {authorName}</span>
              <span className="text-xs text-muted-foreground">{authorTitle} — Creator of products, explorer of frameworks.</span>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;

