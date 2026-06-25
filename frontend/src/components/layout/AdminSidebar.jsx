// src/components/layout/AdminSidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  User,
  FolderKanban,
  Award,
  Briefcase,
  BookOpen,
  Mail,
  LogOut,
  X,
  Code
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '@/lib/utils';

export const AdminSidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { path: '/admin/profile', label: 'Profile', icon: User },
    { path: '/admin/projects', label: 'Projects', icon: FolderKanban },
    { path: '/admin/skills', label: 'Skills', icon: Award },
    { path: '/admin/experience', label: 'Experience', icon: Briefcase },
    { path: '/admin/blog', label: 'Blog Posts', icon: BookOpen },
    { path: '/admin/messages', label: 'Messages', icon: Mail },
  ];

  return (
    <>
      {/* Mobile backdrop shadow */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[85] md:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed top-14 bottom-0 left-0 w-64 bg-card border-r border-border flex flex-col p-6 z-[90] transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0 top-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Code size={20} className="text-primary" />
            <span>DevFolio CMS</span>
          </div>
          <button
            type="button"
            className="md:hidden text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-grow flex flex-col gap-1.5" aria-label="Admin Navigation">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                  isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"
                )
              }
              onClick={onClose}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="pt-4 border-t border-border mt-auto">
          <button
            type="button"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors font-medium cursor-pointer"
            onClick={logout}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
