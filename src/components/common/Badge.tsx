import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'green' | 'amber' | 'red' | 'purple' | 'blue' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'cyan',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    cyan: 'bg-[#50E2E5]/15 text-[#50E2E5] border border-[#50E2E5]/30',
    green: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    red: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    purple: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
    blue: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    gray: 'bg-gray-500/15 text-gray-300 border border-gray-500/30',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 rounded-full',
    md: 'text-xs px-2.5 py-1 rounded-full font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

