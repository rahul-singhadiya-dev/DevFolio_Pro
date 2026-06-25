// src/components/common/Spinner.jsx
import React from 'react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={`flex justify-center items-center ${className}`} role="status">
      <div
        className={`${
          sizeClasses[size] || sizeClasses.md
        } animate-spin rounded-full border-solid border-current border-r-transparent text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]`}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;
