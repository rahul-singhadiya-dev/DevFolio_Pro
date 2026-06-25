// src/pages/admin/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { User, Upload, CheckCircle2, AlertTriangle, Save, KeyRound, Eye, EyeOff } from 'lucide-react';
import client from '../../api/client';
import { useFetch } from '../../hooks/useFetch';
import Spinner from '../../components/common/Spinner';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { resolveAssetUrl } from '../../utils/assets';

export const Profile = () => {
  // Fetch current profile data
  const { data: profile, loading, error, refetch } = useFetch('/profile');

  const [formData, setFormData] = useState({
    fullName: '',
    title: '',
    bio: '',
    avatarUrl: '',
    githubUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    resumeUrl: '',
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [apiError, setApiError] = useState(null);

  const fileInputRef = useRef(null);

  // Change password state
  const [pwdData, setPwdData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [pwdErrors, setPwdErrors] = useState({});
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(null);
  const [pwdApiError, setPwdApiError] = useState(null);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // Sync state when profile fetches successfully
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        title: profile.title || '',
        bio: profile.bio || '',
        avatarUrl: profile.avatarUrl || '',
        githubUrl: profile.githubUrl || '',
        linkedinUrl: profile.linkedinUrl || '',
        twitterUrl: profile.twitterUrl || '',
        resumeUrl: profile.resumeUrl || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handlePwdChange = (e) => {
    const { name, value } = e.target;
    setPwdData((prev) => ({ ...prev, [name]: value }));
    if (pwdErrors[name]) {
      setPwdErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validatePwd = () => {
    const tempErrors = {};
    if (!pwdData.currentPassword) tempErrors.currentPassword = 'Current password is required.';
    if (!pwdData.newPassword) {
      tempErrors.newPassword = 'New password is required.';
    } else if (pwdData.newPassword.length < 8) {
      tempErrors.newPassword = 'New password must be at least 8 characters.';
    }
    if (!pwdData.confirmNewPassword) {
      tempErrors.confirmNewPassword = 'Please confirm your new password.';
    } else if (pwdData.newPassword !== pwdData.confirmNewPassword) {
      tempErrors.confirmNewPassword = 'Passwords do not match.';
    }
    setPwdErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    setPwdSuccess(null);
    setPwdApiError(null);
    if (!validatePwd()) return;
    setPwdSaving(true);
    try {
      const response = await client.post('/auth/change-password', pwdData);
      if (response.data && response.data.success) {
        setPwdSuccess('Password changed successfully. Use your new password on next login.');
        setPwdData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      } else {
        setPwdApiError(response.data.message || 'Failed to change password.');
      }
    } catch (err) {
      setPwdApiError(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setPwdSaving(false);
    }
  };

  // Profile forms validation rules
  const validateForm = () => {
    const tempErrors = {};
    const urlRegex = /^https?:\/\/.+/i;

    if (!formData.fullName.trim()) {
      tempErrors.fullName = 'Full Name is required.';
    }

    if (!formData.title.trim()) {
      tempErrors.title = 'Title/Role is required.';
    }

    if (!formData.bio.trim()) {
      tempErrors.bio = 'Bio is required.';
    } else if (formData.bio.length > 300) {
      tempErrors.bio = 'Bio must be under 300 characters.';
    }

    const checkUrl = (field, errorMsg) => {
      if (formData[field].trim() && !urlRegex.test(formData[field])) {
        tempErrors[field] = errorMsg;
      }
    };

    checkUrl('avatarUrl', 'Enter a valid URL starting with https:// or http://');
    checkUrl('githubUrl', 'Enter a valid URL starting with https://');
    checkUrl('linkedinUrl', 'Enter a valid URL starting with https://');
    checkUrl('twitterUrl', 'Enter a valid URL starting with https://');
    checkUrl('resumeUrl', 'Enter a valid URL starting with https://');

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Submit Profile update handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg(null);
    setApiError(null);

    if (!validateForm()) return;

    setSaving(true);
    try {
      const response = await client.put('/admin/profile', formData);
      if (response.data && response.data.success) {
        setSuccessMsg('Profile updated successfully.');
        // Update fetched hook details as well
        refetch();
      } else {
        setApiError(response.data.message || 'Failed to save changes. Please try again.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save changes. Please try again.';
      setApiError(msg);
    } finally {
      setSaving(false);
    }
  };

  // Trigger file selection for resume upload
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Send selected PDF file to server
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setApiError('Please select a valid PDF document.');
      return;
    }

    setUploadingResume(true);
    setSuccessMsg(null);
    setApiError(null);

    const uploadData = new FormData();
    uploadData.append('resume', file);

    try {
      const response = await client.post('/admin/profile/resume', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.success) {
        const uploadedUrl = response.data.data.resumeUrl;
        setFormData((prev) => ({ ...prev, resumeUrl: uploadedUrl }));
        setSuccessMsg('Resume PDF uploaded successfully. Remember to save changes.');
      } else {
        setApiError(response.data.message || 'Failed to upload PDF resume.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to upload PDF resume.';
      setApiError(msg);
    } finally {
      setUploadingResume(false);
      // Clear file input selection
      e.target.value = null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  const bioLength = formData.bio.length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header className="mb-8 text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Edit Profile</h1>
        <p className="text-sm text-muted-foreground">Update bio, avatar, social links, and resume PDF.</p>
      </header>

      {/* Edit Form Card */}
      <section className="bg-card border border-border rounded-xl p-8 shadow-xs max-w-3xl text-left" aria-label="Profile configurations form">
        {successMsg && (
          <div className="p-4 rounded-md mb-6 text-status flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400" role="status">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {apiError && (
          <div className="p-4 rounded-md mb-6 text-sm flex items-center gap-3 bg-destructive/10 border border-destructive/20 text-destructive" role="alert">
            <AlertTriangle size={18} />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Avatar Preview & URL */}
          <div className="flex items-center gap-4 mb-2 pb-6 border-b border-border text-left">
            {formData.avatarUrl ? (
              <img src={resolveAssetUrl(formData.avatarUrl)} alt="Avatar preview" className="w-20 h-20 rounded-full object-cover border-2 border-primary bg-background" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-border flex items-center justify-center text-muted-foreground">
                <User size={32} />
              </div>
            )}
            <div className="flex-grow">
              <Input
                label="Avatar Image URL"
                name="avatarUrl"
                placeholder="https://images.unsplash.com/... or relative path"
                value={formData.avatarUrl}
                onChange={handleChange}
                error={errors.avatarUrl}
                disabled={saving || uploadingResume}
              />
            </div>
          </div>

          {/* Primary Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="fullName"
              placeholder="Alex Carter"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              disabled={saving}
              required
            />
            <Input
              label="Title / Role"
              name="title"
              placeholder="Full-Stack Developer"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              disabled={saving}
              required
            />
          </div>

          {/* Bio text area with character counts */}
          <div className="flex flex-col w-full">
            <div className="flex justify-between w-full">
              <span className="text-xs font-semibold text-foreground tracking-wider uppercase">Bio Description</span>
              <span className={`text-xs ${bioLength > 300 ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                {bioLength} / 300 characters
              </span>
            </div>
            <textarea
              name="bio"
              className={`w-full text-base px-3.5 py-2.5 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] mt-2 text-left ${errors.bio ? 'border-destructive focus-visible:border-destructive' : ''}`}
              placeholder="Tell visitors about your professional background..."
              value={formData.bio}
              onChange={handleChange}
              disabled={saving}
            />
            {errors.bio && <span className="text-xs text-destructive font-medium mt-1">{errors.bio}</span>}
          </div>

          {/* Social Links Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="GitHub Profile URL"
              name="githubUrl"
              placeholder="https://github.com/username"
              value={formData.githubUrl}
              onChange={handleChange}
              error={errors.githubUrl}
              disabled={saving}
            />
            <Input
              label="LinkedIn Profile URL"
              name="linkedinUrl"
              placeholder="https://linkedin.com/in/username"
              value={formData.linkedinUrl}
              onChange={handleChange}
              error={errors.linkedinUrl}
              disabled={saving}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Twitter Profile URL"
              name="twitterUrl"
              placeholder="https://twitter.com/username"
              value={formData.twitterUrl}
              onChange={handleChange}
              error={errors.twitterUrl}
              disabled={saving}
            />
            
            {/* Resume Upload File field */}
            <div className="flex flex-col gap-2 w-full text-left">
              <span className="text-xs font-semibold text-foreground tracking-wider uppercase">Resume Document (PDF)</span>
              <div className="flex gap-3 items-end">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="application/pdf"
                  className="sr-only"
                  aria-label="Upload resume PDF file"
                />
                <div className="flex-grow">
                  <Input
                    name="resumeUrl"
                    placeholder="Upload a PDF file using the button →"
                    value={formData.resumeUrl}
                    onChange={handleChange}
                    error={errors.resumeUrl}
                    disabled={true} // read-only text, filled by the upload action
                    className="mb-0"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUploadClick}
                  disabled={saving || uploadingResume}
                  loading={uploadingResume}
                  className="h-9 shrink-0 px-4"
                >
                  <Upload size={16} /> Upload
                </Button>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              disabled={saving || uploadingResume}
            >
              <Save size={16} /> Save Changes
            </Button>
          </div>
        </form>
      </section>

      {/* Change Password Section */}
      <section
        className="bg-card border border-border rounded-xl p-8 shadow-xs max-w-3xl text-left mt-8"
        aria-label="Change password form"
      >
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-border">
          <div style={{
            width: '36px', height: '36px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-text-primary)',
          }}>
            <KeyRound size={16} />
          </div>
          <div>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)', margin: 0 }}>Change Password</h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>Update your admin account password securely.</p>
          </div>
        </div>

        {pwdSuccess && (
          <div style={{
            padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem',
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)',
            color: '#059669', fontSize: 'var(--text-sm)',
          }} role="status">
            <CheckCircle2 size={16} />
            <span>{pwdSuccess}</span>
          </div>
        )}

        {pwdApiError && (
          <div style={{
            padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem',
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            backgroundColor: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--color-error)', fontSize: 'var(--text-sm)',
          }} role="alert">
            <AlertTriangle size={16} />
            <span>{pwdApiError}</span>
          </div>
        )}

        <form onSubmit={handlePwdSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Current Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Current Password <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showCurrentPwd ? 'text' : 'password'}
                name="currentPassword"
                value={pwdData.currentPassword}
                onChange={handlePwdChange}
                disabled={pwdSaving}
                placeholder="Enter current password"
                autoComplete="current-password"
                style={{
                  width: '100%', padding: '0.5rem 2.5rem 0.5rem 0.75rem',
                  border: `1px solid ${pwdErrors.currentPassword ? 'var(--color-error)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)',
                  backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)',
                  boxSizing: 'border-box', fontFamily: 'var(--font-sans)',
                }}
              />
              <button type="button" onClick={() => setShowCurrentPwd(v => !v)} tabIndex={-1}
                style={{ position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', display: 'flex', padding: '0' }}>
                {showCurrentPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {pwdErrors.currentPassword && <span style={{ color: 'var(--color-error)', fontSize: 'var(--text-xs)' }}>{pwdErrors.currentPassword}</span>}
          </div>

          {/* New Password & Confirm — side by side on md+ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {/* New Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                New Password <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPwd ? 'text' : 'password'}
                  name="newPassword"
                  value={pwdData.newPassword}
                  onChange={handlePwdChange}
                  disabled={pwdSaving}
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
                  style={{
                    width: '100%', padding: '0.5rem 2.5rem 0.5rem 0.75rem',
                    border: `1px solid ${pwdErrors.newPassword ? 'var(--color-error)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)',
                    backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)',
                    boxSizing: 'border-box', fontFamily: 'var(--font-sans)',
                  }}
                />
                <button type="button" onClick={() => setShowNewPwd(v => !v)} tabIndex={-1}
                  style={{ position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', display: 'flex', padding: '0' }}>
                  {showNewPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Strength bar */}
              {pwdData.newPassword && (
                <div style={{ display: 'flex', gap: '3px', marginTop: '4px' }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{
                      height: '3px', flex: 1, borderRadius: '2px',
                      backgroundColor: pwdData.newPassword.length >= i * 3
                        ? (pwdData.newPassword.length < 8 ? '#f59e0b' : pwdData.newPassword.length < 12 ? '#3b82f6' : '#10b981')
                        : 'var(--color-border)',
                    }} />
                  ))}
                </div>
              )}
              {pwdErrors.newPassword && <span style={{ color: 'var(--color-error)', fontSize: 'var(--text-xs)' }}>{pwdErrors.newPassword}</span>}
            </div>

            {/* Confirm New Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Confirm New Password <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPwd ? 'text' : 'password'}
                  name="confirmNewPassword"
                  value={pwdData.confirmNewPassword}
                  onChange={handlePwdChange}
                  disabled={pwdSaving}
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                  style={{
                    width: '100%', padding: '0.5rem 2.5rem 0.5rem 0.75rem',
                    border: `1px solid ${pwdErrors.confirmNewPassword ? 'var(--color-error)' : (pwdData.confirmNewPassword && pwdData.confirmNewPassword === pwdData.newPassword ? 'var(--color-success)' : 'var(--color-border)')}`,
                    borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)',
                    backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)',
                    boxSizing: 'border-box', fontFamily: 'var(--font-sans)',
                  }}
                />
                <button type="button" onClick={() => setShowConfirmPwd(v => !v)} tabIndex={-1}
                  style={{ position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', display: 'flex', padding: '0' }}>
                  {showConfirmPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {pwdErrors.confirmNewPassword && <span style={{ color: 'var(--color-error)', fontSize: 'var(--text-xs)' }}>{pwdErrors.confirmNewPassword}</span>}
              {pwdData.confirmNewPassword && pwdData.confirmNewPassword === pwdData.newPassword && !pwdErrors.confirmNewPassword && (
                <span style={{ color: 'var(--color-success)', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <CheckCircle2 size={11} /> Passwords match
                </span>
              )}
            </div>
          </div>

          {/* Submit */}
          <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="primary"
              loading={pwdSaving}
              disabled={pwdSaving}
            >
              <KeyRound size={15} /> Update Password
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Profile;

