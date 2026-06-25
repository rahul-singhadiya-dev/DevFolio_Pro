// src/components/common/Badge.jsx
import React from 'react';
import { Badge as ShadcnBadge } from '@/components/ui/badge';

export const Badge = ({ children, variant = 'primary', className = '', ...props }) => {
  // Map our custom variants to shadcn equivalents
  const shadcnVariant = variant === 'primary' ? 'default' : variant;
  
  return (
    <ShadcnBadge variant={shadcnVariant} className={className} {...props}>
      {children}
    </ShadcnBadge>
  );
};

export default Badge;
