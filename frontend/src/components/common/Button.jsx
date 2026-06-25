// src/components/common/Button.jsx
import React from 'react';
import { Button as ShadcnButton } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(({
  children,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}, ref) => {
  // Map our custom variants to shadcn equivalents
  const shadcnVariant = variant === 'primary' ? 'default' : variant;
  
  return (
    <ShadcnButton
      ref={ref}
      variant={shadcnVariant}
      disabled={disabled || loading}
      className={`${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </ShadcnButton>
  );
});

Button.displayName = 'Button';

export default Button;
