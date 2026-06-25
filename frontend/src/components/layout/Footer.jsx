// src/components/layout/Footer.jsx
import React, { useEffect, useState } from 'react';
import client from '../../api/client';

export const Footer = () => {
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
        console.error('Footer profile fetch error:', err);
      }
    };
    fetchProfile();
    return () => {
      active = false;
    };
  }, []);

  const currentYear = new Date().getFullYear();
  const name = profile?.fullName || 'Developer';

  return (
    <footer className="w-full border-t border-border bg-background py-8 mt-16 sm:mt-24 transition-colors duration-250">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-xs text-muted-foreground">
          © {currentYear} {name}. All rights reserved.
        </div>
        <nav className="flex items-center gap-6" aria-label="Social links directory">
          {profile?.githubUrl && (
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              GitHub
            </a>
          )}
          {profile?.linkedinUrl && (
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              LinkedIn
            </a>
          )}
          {profile?.twitterUrl && (
            <a
              href={profile.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Twitter
            </a>
          )}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
