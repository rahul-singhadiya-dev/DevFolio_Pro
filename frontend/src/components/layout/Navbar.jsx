// src/components/layout/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Sun, Moon, Menu, X, Code2, Download, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import client from '../../api/client';
import { resolveAssetUrl } from '../../utils/assets';
import { cn } from '@/lib/utils';

export const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchProfile = async () => {
      try {
        const response = await client.get('/profile');
        if (active && response.data && response.data.success) {
          setProfile(response.data.data);
        }
      } catch (err) {
        console.error('Navbar profile fetch error:', err);
      }
    };
    fetchProfile();
    return () => {
      active = false;
    };
  }, []);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/projects', label: 'Projects' },
    { path: '/blog', label: 'Blog' },
    { path: '/resume', label: 'Resume' },
    { path: '/contact', label: 'Contact' },
  ];

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  const name = profile?.fullName || 'Developer';
  const github = profile?.githubUrl || 'https://github.com';
  const resume = resolveAssetUrl(profile?.resumeUrl);

  return (
    <header className={cn(
      "fixed left-0 right-0 top-0 z-[1000] border-b border-border transition-colors duration-250",
      mobileMenuOpen ? "bg-background" : "bg-glass backdrop-blur-md"
    )}>
      <div className="relative z-[1002] flex justify-between items-center h-16 w-full max-w-[1200px] mx-auto px-6 md:px-8">
        {/* Logo Branding */}
        <Link to="/" className="font-semibold text-sm text-foreground flex items-center gap-2 tracking-tight hover:opacity-90 transition-opacity" aria-label={`${name} — home`}>
          <div className="w-5 h-5 rounded-sm bg-gradient-to-br from-black to-[#444] dark:from-white dark:to-[#888] flex items-center justify-center text-white dark:text-black">
            <Code2 size={12} />
          </div>
          <span>{name}</span>
        </Link>

        {/* Center menu links */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Primary Navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "text-xs font-medium transition-colors hover:text-foreground",
                  isActive ? "text-foreground font-semibold" : "text-muted-foreground"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          {isAuthenticated && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cn(
                  "text-xs font-medium transition-colors hover:text-foreground",
                  isActive ? "text-foreground font-semibold" : "text-muted-foreground"
                )
              }
            >
              Dashboard
            </NavLink>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            {github && (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                GitHub
              </a>
            )}
            {github && resume && <span aria-hidden="true" className="h-3.5 w-[1px] bg-border"></span>}
            {resume && (
              <a href={resume} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full bg-foreground text-background hover:bg-muted-foreground px-4 py-1.5 text-xs font-semibold transition-all hover:scale-[1.01]">
                <Download size={12} />
                <span>Resume</span>
              </a>
            )}
            {((github || resume) && isAuthenticated) && <span aria-hidden="true" className="h-3.5 w-[1px] bg-border"></span>}
            {isAuthenticated && (
              <Link to="/admin" title="Admin Dashboard" className="inline-flex rounded-full transition-transform duration-150 hover:scale-108">
                {profile?.avatarUrl ? (
                  <div
                    className="h-8 w-8 rounded-full border border-border bg-card bg-cover bg-center inline-flex items-center justify-center"
                    style={{ backgroundImage: `url(${resolveAssetUrl(profile.avatarUrl)})` }}
                    aria-hidden="true"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full border border-border bg-card inline-flex items-center justify-center" aria-hidden="true">
                    <User size={16} className="text-muted-foreground opacity-70" />
                  </div>
                )}
              </Link>
            )}
            {!isAuthenticated && (
              <>
                {(github || resume) && <span aria-hidden="true" className="h-3.5 w-[1px] bg-border"></span>}
                <Link
                  to="/admin/login"
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center gap-1.5"
                  title="Admin Login"
                >
                  <User size={13} />
                  <span>Admin</span>
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="bg-transparent border-none cursor-pointer text-muted-foreground flex items-center justify-center rounded-full w-8 h-8 transition-colors hover:bg-border/50 hover:text-foreground"
            onClick={toggleTheme}
            aria-label="Switch theme"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          <button
            type="button"
            className="bg-transparent border border-border cursor-pointer text-foreground flex items-center justify-center w-8 h-8 rounded-sm bg-card md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 bottom-0 z-[1001] flex flex-col p-8 gap-6 md:hidden border-t border-border"
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(20, 20, 20, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)'
            }}
            aria-label="Mobile Navigation"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "text-lg font-semibold text-muted-foreground py-2 border-b border-border transition-colors hover:text-foreground",
                    isActive && "text-foreground border-foreground/30"
                  )
                }
                onClick={handleLinkClick}
              >
                {item.label}
              </NavLink>
            ))}
            {isAuthenticated && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  cn(
                    "text-lg font-semibold text-muted-foreground py-2 border-b border-border transition-colors hover:text-foreground",
                    isActive && "text-foreground border-foreground/30"
                  )
                }
                onClick={handleLinkClick}
              >
                Dashboard
              </NavLink>
            )}
            {!isAuthenticated && (
              <NavLink
                to="/admin/login"
                className={({ isActive }) =>
                  cn(
                    "text-lg font-semibold text-muted-foreground py-2 border-b border-border transition-colors hover:text-foreground",
                    isActive && "text-foreground border-foreground/30"
                  )
                }
                onClick={handleLinkClick}
              >
                Admin Login
              </NavLink>
            )}
            {github && (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-muted-foreground py-2 border-b border-border transition-colors hover:text-foreground"
                onClick={handleLinkClick}
              >
                GitHub
              </a>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
