import { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm text-secondary font-medium">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`min-h-[80px] rounded-md bg-white/5 border border-default px-3 py-2 text-sm text-primary placeholder:text-tertiary transition-all duration-fast focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed resize-none ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/40' : ''} ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs text-red-400">{error}</span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
