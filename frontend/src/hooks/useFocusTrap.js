// src/hooks/useFocusTrap.js
import { useEffect } from 'react';

export const useFocusTrap = (ref, active) => {
  useEffect(() => {
    if (!active || !ref.current) return;

    const modalElement = ref.current;
    
    // Find all focusable child elements
    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = modalElement.querySelectorAll(focusableSelectors);
      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab (navigating backwards)
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // Tab (navigating forwards)
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    // Save previous active element to restore focus on unmount
    const previousActiveElement = document.activeElement;

    // Focus the first focusable element inside the modal
    const focusableElements = modalElement.querySelectorAll(focusableSelectors);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement && previousActiveElement.focus) {
        previousActiveElement.focus();
      }
    };
  }, [active, ref]);
};

export default useFocusTrap;
