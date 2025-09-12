import React from 'react';

export interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  label: string;
  value?: string | number;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * StatusBadge component for web (Next.js) using Tailwind CSS
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  value,
  size = 'medium',
  className = '',
}) => {
  const getStatusClasses = () => {
    switch (status) {
      case 'success':
        return 'border-green-500 bg-green-900 text-green-200';
      case 'warning':
        return 'border-yellow-500 bg-yellow-900 text-yellow-200';
      case 'error':
        return 'border-red-500 bg-red-900 text-red-200';
      case 'info':
        return 'border-blue-500 bg-blue-900 text-blue-200';
      case 'neutral':
      default:
        return 'border-gray-500 bg-gray-700 text-gray-300';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-2 py-1 text-xs';
      case 'large':
        return 'px-4 py-3 text-base';
      case 'medium':
      default:
        return 'px-3 py-2 text-sm';
    }
  };

  const getIndicatorSize = () => {
    switch (size) {
      case 'small':
        return 'w-2 h-2';
      case 'large':
        return 'w-3 h-3';
      case 'medium':
      default:
        return 'w-2.5 h-2.5';
    }
  };

  return (
    <div className={`
      inline-flex items-center rounded-lg border
      ${getStatusClasses()}
      ${getSizeClasses()}
      ${className}
    `}>
      <div className={`rounded-full mr-2 ${getIndicatorSize()}`} 
           style={{ backgroundColor: 'currentColor' }} />
      
      <div className="flex-1 flex justify-between items-center">
        <span className="font-medium">{label}</span>
        {value !== undefined && (
          <span className="font-semibold ml-2">{value}</span>
        )}
      </div>
    </div>
  );
};