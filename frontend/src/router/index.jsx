// src/router/index.jsx
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';

// Layouts
import PublicLayout from '../components/layout/PublicLayout';
import AdminLayout from '../components/layout/AdminLayout';

// Lazy Loaded Pages - Public
const Home = lazy(() => import('../pages/public/Home'));
const Projects = lazy(() => import('../pages/public/Projects'));
const ProjectDetail = lazy(() => import('../pages/public/ProjectDetail'));
const Blog = lazy(() => import('../pages/public/Blog'));
const BlogPost = lazy(() => import('../pages/public/BlogPost'));
const Resume = lazy(() => import('../pages/public/Resume'));
const Contact = lazy(() => import('../pages/public/Contact'));

// Lazy Loaded Pages - Auth
const Login = lazy(() => import('../pages/auth/Login'));

// Lazy Loaded Pages - Admin
const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const Profile = lazy(() => import('../pages/admin/Profile'));
const ManageProjects = lazy(() => import('../pages/admin/Projects'));
const CreateProject = lazy(() => import('../pages/admin/CreateProject'));
const EditProject = lazy(() => import('../pages/admin/EditProject'));
const ManageSkills = lazy(() => import('../pages/admin/Skills'));
const ManageExperience = lazy(() => import('../pages/admin/Experience'));
const ManageBlog = lazy(() => import('../pages/admin/Blog'));
const CreateBlogPost = lazy(() => import('../pages/admin/CreateBlogPost'));
const EditBlogPost = lazy(() => import('../pages/admin/EditBlogPost'));
const Messages = lazy(() => import('../pages/admin/Messages'));

// Lazy Loaded Pages - Errors
const NotFound = lazy(() => import('../pages/errors/NotFound'));
const ServerError = lazy(() => import('../pages/errors/ServerError'));

// ProtectedRoute Wrapper Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--color-bg)' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthorized requests silently to /admin/login
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

// Route definitions component
export const AppRoutes = () => {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spinner size="md" />
      </div>
    }>
      <Routes>
        {/* Public Visitor Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* Auth Route */}
        <Route path="/admin/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="projects" element={<ManageProjects />} />
          <Route path="projects/new" element={<CreateProject />} />
          <Route path="projects/:id/edit" element={<EditProject />} />
          <Route path="skills" element={<ManageSkills />} />
          <Route path="experience" element={<ManageExperience />} />
          <Route path="blog" element={<ManageBlog />} />
          <Route path="blog/new" element={<CreateBlogPost />} />
          <Route path="blog/:id/edit" element={<EditBlogPost />} />
          <Route path="messages" element={<Messages />} />
        </Route>

        {/* Fallbacks */}
        <Route path="/404" element={<NotFound />} />
        <Route path="/500" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
