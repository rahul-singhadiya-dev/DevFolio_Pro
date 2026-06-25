// src/components/common/EmptyState.jsx
import React from 'react';
import Button from './Button';

export const EmptyState = ({
  icon: Icon,
  heading,
  subheading,
  ctaText,
  onCtaClick,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto border border-dashed border-border rounded-lg bg-card/30 text-card-foreground ${className}`}>
      {Icon && (
        <div className="p-3 rounded-full bg-muted text-muted-foreground mb-4">
          <Icon size={48} strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-base font-semibold text-foreground mb-1">{heading}</h3>
      {subheading && <p className="text-sm text-muted-foreground mb-6 max-w-xs">{subheading}</p>}
      {ctaText && onCtaClick && (
        <Button variant="primary" onClick={onCtaClick} className="mt-2">
          {ctaText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
