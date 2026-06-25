// src/components/common/Input.jsx
import React from 'react';
import { Input as ShadcnInput } from '@/components/ui/input';

export const Input = React.forwardRef(({
  label,
  name,
  type = 'text',
  error,
  options = [],
  rows = 4,
  disabled = false,
  value,
  onChange,
  checked,
  id,
  className = '',
  ...props
}, ref) => {
  const inputId = id || name;

  if (type === 'switch' || type === 'checkbox') {
    return (
      <label className="flex items-center gap-3 cursor-pointer select-none py-1.5">
        <div className="relative inline-flex items-center">
          <input
            type="checkbox"
            id={inputId}
            name={name}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="sr-only peer"
            ref={ref}
            {...props}
          />
          <div className="w-9 h-5 bg-border/80 dark:bg-muted rounded-full peer peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
        </div>
        {label && <span className="text-sm font-medium text-foreground">{label}</span>}
      </label>
    );
  }

  const commonClass = `flex w-full rounded-md border ${
    error ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20' : 'border-input'
  } bg-background/50 dark:bg-input/20 px-3 py-1.5 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`;

  return (
    <div className="flex flex-col gap-1.5 w-full text-left">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-foreground tracking-wider uppercase">
          {label}
        </label>
      )}

      {type === 'textarea' ? (
        <textarea
          id={inputId}
          name={name}
          className={`${commonClass} h-auto py-2`}
          rows={rows}
          disabled={disabled}
          value={value}
          onChange={onChange}
          ref={ref}
          {...props}
        />
      ) : type === 'select' ? (
        <select
          id={inputId}
          name={name}
          className={`${commonClass} h-9 appearance-none bg-no-repeat bg-[right_0.75rem_center]`}
          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundSize: '1.25rem' }}
          disabled={disabled}
          value={value}
          onChange={onChange}
          ref={ref}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-background text-foreground">
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <ShadcnInput
          type={type}
          id={inputId}
          name={name}
          className={`${error ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20' : ''} ${className}`}
          disabled={disabled}
          value={value}
          onChange={onChange}
          ref={ref}
          {...props}
        />
      )}

      {error && <span className="text-xs text-destructive font-medium mt-0.5">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
