/**
 * @file Select.tsx
 * @description Dropdown select component with label support
 * 
 * A styled dropdown select component for choosing from a list
 * of predefined options.
 * 
 * @author SST Development Team
 * @license Non-Commercial Open Source - See LICENSE for terms
 * @version 1.0.0
 * @lastUpdated 2025-01-15
 * 
 * PROPS:
 * - label: Optional field label
 * - options: Array of { value, label } objects
 * - ...HTMLSelectAttributes
 * 
 * STYLING:
 * Dark theme styling matching other form inputs.
 * Custom dropdown arrow styling.
 */
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-surface-600">{label}</label>
      )}
      <select
        className={`px-4 py-2.5 bg-white border border-surface-300 rounded-lg text-surface-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all appearance-none cursor-pointer ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-white">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
