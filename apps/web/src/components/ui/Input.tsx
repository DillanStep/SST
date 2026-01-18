/**
 * @file Input.tsx
 * @description Text input component with label, error, and icon support
 * 
 * A styled text input component for forms with optional label,
 * validation error display, and icon prefix.
 * 
 * @author SST Development Team
 * @license Non-Commercial Open Source - See LICENSE for terms
 * @version 1.0.0
 * @lastUpdated 2025-01-15
 * 
 * PROPS:
 * - label: Optional field label
 * - error: Error message (shows in red)
 * - icon: Optional prefix icon
 * - ...HTMLInputAttributes
 * 
 * STYLING:
 * Dark theme styling with focus ring.
 * Error state shows red border and message.
 */
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-surface-700">{label}</label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 transition-colors group-focus-within:text-surface-600">
            {icon}
          </div>
        )}
        <input
          className={`w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-surface-800 placeholder-surface-400 focus:bg-white focus:border-surface-400 focus:ring-2 focus:ring-surface-200 transition-all duration-200 ${icon ? 'pl-11' : ''} ${error ? 'border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-100' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-600 animate-fade-in">{error}</p>}
    </div>
  );
};

export default Input;
