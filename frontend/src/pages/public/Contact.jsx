// src/pages/public/Contact.jsx
import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import client from '../../api/client';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Field change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error on type
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Perform validation on submit, not on change
  const validateForm = () => {
    const tempErrors = {};
    if (!formData.name.trim()) {
      tempErrors.name = 'Please enter your name.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      tempErrors.email = 'Enter a valid email address.';
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = 'Enter a valid email address.';
    }

    if (!formData.subject.trim()) {
      tempErrors.subject = "Subject is required.";
    }

    if (!formData.message.trim()) {
      tempErrors.message = 'Message must be at least 20 characters.';
    } else if (formData.message.trim().length < 20) {
      tempErrors.message = 'Message must be at least 20 characters.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Submit contact message handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const response = await client.post('/contact', formData);
      if (response.data && response.data.success) {
        setSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setApiError(response.data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again or email me directly.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 md:px-8">
      {/* Header */}
      <header className="text-center max-w-[600px] mx-auto py-12">
        <span className="section-label">05 — Get In Touch</span>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 tracking-tight">Let's Work Together</h1>
        <p className="text-sm text-muted-foreground">
          Have a project, opportunity, or question? I'd love to hear from you.
        </p>
      </header>

      {/* Form Card */}
      <section className="bg-card border border-border rounded-2xl p-8 shadow-md max-w-[600px] mx-auto mb-20 text-left" aria-label="Contact form container">
        {success ? (
          // Success State Card
          <div className="text-center py-10 px-6 flex flex-col items-center gap-4">
            <CheckCircle2 size={56} className="text-emerald-500 mb-2" />
            <h2 className="text-lg font-semibold text-foreground max-w-sm">
              Message sent! I'll get back to you within 1–2 business days.
            </h2>
            <Button variant="outline" onClick={() => setSuccess(false)} style={{ marginTop: '1rem' }}>
              Send Another Message
            </Button>
          </div>
        ) : (
          // Contact Form view
          <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
            {apiError && (
              <div className="p-4 rounded-md mb-2 text-sm flex items-center gap-3 font-medium bg-destructive/10 border border-destructive/20 text-destructive" role="alert">
                <AlertTriangle size={18} />
                <span>{apiError}</span>
              </div>
            )}

            <Input
              label="Name"
              name="name"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              disabled={submitting}
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              disabled={submitting}
              required
            />

            <Input
              label="Subject"
              name="subject"
              placeholder="What's this about?"
              value={formData.subject}
              onChange={handleChange}
              error={errors.subject}
              disabled={submitting}
              required
            />

            <Input
              label="Message"
              name="message"
              type="textarea"
              placeholder="Tell me about your project or question..."
              value={formData.message}
              onChange={handleChange}
              error={errors.message}
              disabled={submitting}
              required
            />

            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              disabled={submitting}
              className="mt-2 w-full justify-center animate-none"
            >
              Send Message <ArrowRight size={16} />
            </Button>
          </form>
        )}
      </section>
    </div>
  );
};

export default Contact;

