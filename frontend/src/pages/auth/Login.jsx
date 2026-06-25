// src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // If already authenticated, redirect to /admin immediately
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.email.trim()) {
      tempErrors.email = 'Enter a valid email address.';
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = 'Enter a valid email address.';
    }

    if (!formData.password) {
      tempErrors.password = 'Password is required.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/admin', { replace: true });
      } else {
        setApiError(result.message || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      setApiError('Login failed. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] flex justify-center items-center p-6 bg-background text-left" aria-label="Admin Login Page">
      <div className="w-full max-w-[400px] bg-card/30 backdrop-blur-xs border border-border rounded-xl p-8 shadow-md">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1.5">Welcome Back</h1>
          <p className="text-xs text-muted-foreground">Sign in to manage your portfolio.</p>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {apiError && (
            <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive text-xs px-3 py-2.5 rounded-lg" role="alert">
              <AlertCircle size={16} className="shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="admin@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            disabled={submitting}
            required
            autoComplete="email"
          />

          <div className="relative w-full">
            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              disabled={submitting}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground cursor-pointer outline-none"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute',
                right: '12px',
                top: errors.password ? 'calc(50% - 10px)' : 'calc(50% + 2px)',
                transform: 'translateY(-50%)',
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={submitting}
            disabled={submitting}
            className="mt-4"
          >
            Sign In
          </Button>
        </form>

        <p className="text-center text-[10px] text-muted-foreground/80 mt-6">
          Locked out? Update credentials via server environment.
        </p>
      </div>
    </main>
  );
};

export default Login;
