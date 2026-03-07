'use client';

import React from 'react';
import { Spinner } from '@/components/ui/spinner';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullHeight?: boolean;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  fullHeight = false,
  message,
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const containerClass = fullHeight ? 'min-h-screen' : 'py-8';

  return (
    <div
      className={`flex flex-col items-center justify-center ${containerClass} gap-4`}
    >
      <Spinner className={sizeClasses[size]} />
      {message && (
        <p className="text-muted-foreground text-center">{message}</p>
      )}
    </div>
  );
};
