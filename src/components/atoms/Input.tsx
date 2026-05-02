import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm text-secondary font-medium">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`h-10 rounded-md bg-white/5 border border-default px-3 text-sm text-primary placeholder:text-tertiary transition-all duration-fast focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/40' : ''} ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs text-red-400">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
