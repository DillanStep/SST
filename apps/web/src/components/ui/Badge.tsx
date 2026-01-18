/**
 * @file Badge.tsx
 * @description Status badge component for labels and indicators
 * 
 * A small badge component for displaying status, category,
 * or other label information with color-coded variants.
 * 
 * @author SST Development Team
 * @license Non-Commercial Open Source - See LICENSE for terms
 * @version 1.0.0
 * @lastUpdated 2025-01-15
 * 
 * VARIANTS:
 * - default - Neutral gray
 * - success - Positive/green
 * - warning - Caution/yellow
 * - error   - Negative/red
 * - info    - Informational/blue
 * 
 * PROPS:
 * - variant: Color scheme
 * - children: Badge text
 * - className: Additional CSS classes
 */
import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
}) => {
  const variantClasses = {
    default: 'bg-surface-100 text-surface-600 border border-surface-300',
    success: 'bg-green-50 text-green-700 border border-green-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    error: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-primary-50 text-primary-700 border border-primary-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
