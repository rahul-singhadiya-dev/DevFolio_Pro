// src/pages/admin/Dashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  BookOpen,
  Mail,
  Eye,
  PlusCircle,
  FileEdit,
  Inbox,
  AlertTriangle
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import Spinner from '../../components/common/Spinner';
import ErrorBoundary from '../../components/common/ErrorBoundary';

export const Dashboard = () => {
  // Fetch aggregate statistics from backend
  const { data: stats, loading, error, refetch } = useFetch('/admin/dashboard');

  // Fetch profile to render the developer's name
  const { data: profile } = useFetch('/profile');

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
        <h3 className="text-lg font-semibold text-destructive mb-2">Failed to load dashboard statistics</h3>
        <p className="text-sm text-muted-foreground mb-6">{error}</p>
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

  const name = profile?.fullName || 'Alex';

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header className="mb-8 text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Here's a quick look at your portfolio activity.</p>
      </header>

      {/* Welcome Alert */}
      <div className="bg-primary/10 border border-primary/20 text-primary text-sm font-medium px-6 py-4 rounded-xl mb-8 text-left">
        Everything looks good, {name}. Keep building.
      </div>

      {/* Stats Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10 text-left" aria-label="Quick statistics cards">
        {/* Total Projects */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-xs flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <FolderKanban size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1">Total Projects</span>
            <span className="text-2xl font-bold text-foreground leading-none">{stats?.totalProjects || 0}</span>
          </div>
        </div>

        {/* Published Blog Posts */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-xs flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <BookOpen size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1">Published Posts</span>
            <span className="text-2xl font-bold text-foreground leading-none">{stats?.totalBlogPosts || 0}</span>
          </div>
        </div>

        {/* Unread Messages */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-xs flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: stats?.unreadMessages > 0 ? 'rgba(217, 119, 6, 0.08)' : 'rgba(22, 163, 74, 0.08)',
              color: stats?.unreadMessages > 0 ? 'var(--color-ring)' : 'oklch(0.627 0.194 149.214)',
            }}
          >
            <Mail size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1">Unread Messages</span>
            <span
              className="text-2xl font-bold text-foreground leading-none"
              style={{ color: stats?.unreadMessages > 0 ? 'var(--color-ring)' : 'inherit' }}
            >
              {stats?.unreadMessages || 0}
            </span>
          </div>
        </div>

        {/* Total Project Views */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-xs flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Eye size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1">Total Project Views</span>
            <span className="text-2xl font-bold text-foreground leading-none">{stats?.totalProjectViews || 0}</span>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <ErrorBoundary>
        <section className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-xs text-left" aria-label="Quick Actions">
          <h2 className="text-lg font-semibold text-foreground mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/admin/projects/new" className="border border-border bg-background p-5 rounded-lg text-center transition-all duration-200 flex flex-col items-center gap-2 hover:border-primary/50 hover:bg-card hover:-translate-y-0.5 group">
              <PlusCircle size={24} className="text-muted-foreground group-hover:text-primary transition-colors duration-200" />
              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200">Add New Project</span>
            </Link>
            <Link to="/admin/blog/new" className="border border-border bg-background p-5 rounded-lg text-center transition-all duration-200 flex flex-col items-center gap-2 hover:border-primary/50 hover:bg-card hover:-translate-y-0.5 group">
              <FileEdit size={24} className="text-muted-foreground group-hover:text-primary transition-colors duration-200" />
              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200">Write a Post</span>
            </Link>
            <Link to="/admin/messages" className="border border-border bg-background p-5 rounded-lg text-center transition-all duration-200 flex flex-col items-center gap-2 hover:border-primary/50 hover:bg-card hover:-translate-y-0.5 group">
              <Inbox size={24} className="text-muted-foreground group-hover:text-primary transition-colors duration-200" />
              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200">View Messages</span>
            </Link>
          </div>
        </section>
      </ErrorBoundary>
    </div>
  );
};

export default Dashboard;

