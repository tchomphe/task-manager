import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
    return (
      <div>
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <input
          {...props}
          id={inputId}
          ref={ref}
          className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            error ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-indigo-500'
          } ${className}`}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
