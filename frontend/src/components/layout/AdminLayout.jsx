// src/components/layout/AdminLayout.jsx
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, Sun, Moon, Code } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import { useTheme } from '../../hooks/useTheme';

/** Map route segments to human-readable page titles shown in the top-bar */
const PAGE_TITLES = {
  '/admin': 'Dashboard',
  '/admin/profile': 'Profile',
  '/admin/projects': 'Projects',
  '/admin/projects/new': 'New Project',
  '/admin/skills': 'Skills',
  '/admin/experience': 'Experience',
  '/admin/blog': 'Blog Posts',
  '/admin/blog/new': 'New Post',
  '/admin/messages': 'Messages',
};

const getPageTitle = (pathname) => {
  // Exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Edit routes: /admin/projects/:id/edit  /admin/blog/:id/edit
  if (/\/admin\/projects\/.+\/edit/.test(pathname)) return 'Edit Project';
  if (/\/admin\/blog\/.+\/edit/.test(pathname)) return 'Edit Post';
  return 'Admin Panel';
};

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Top-bar (visible on ALL breakpoints) ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14 border-b border-border bg-card/80 backdrop-blur-md"
        style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      >
        {/* Left: hamburger (mobile) + logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="md:hidden text-muted-foreground hover:text-foreground cursor-pointer mr-1"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>
          {/* Logo — hidden on md+ because sidebar already shows it */}
          <div className="flex items-center gap-2 md:hidden">
            <Code size={18} className="text-primary" />
            <span className="font-bold text-sm text-foreground">DevFolio CMS</span>
          </div>
          {/* Desktop: show current page title */}
          <span className="hidden md:block text-sm font-semibold text-foreground">
            {pageTitle}
          </span>
        </div>

        {/* Right: theme toggle */}
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground cursor-pointer p-1.5 rounded-md hover:bg-muted transition-colors"
          onClick={toggleTheme}
          aria-label="Switch theme"
        >
          {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
        </button>
      </header>

      {/* ── Body row (sidebar + content) ── */}
      <div className="flex flex-1 pt-14">
        {/* Sidebar navigation */}
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main workspace */}
        <main className="flex-grow md:ml-64 w-full min-h-[calc(100vh-3.5rem)]">
          <div className="max-w-5xl mx-auto px-6 py-8 md:px-10 md:py-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
