'use client';

import React from 'react';
import { PropertyCard } from './PropertyCard';
import { EmptyState } from './EmptyState';
import { Property } from '@/types';
import { Search } from 'lucide-react';

interface PropertyGridProps {
  properties: Property[];
  isLoading?: boolean;
  onBookmark?: (id: string) => void;
  bookmarkedIds?: Set<string>;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

export const PropertyGrid: React.FC<PropertyGridProps> = ({
  properties,
  isLoading = false,
  onBookmark,
  bookmarkedIds = new Set(),
  columns = 3,
  gap = 'md',
}) => {
  const colsMap = {
    1: 'grid-cols-1',
    2: 'sm:grid-cols-2 lg:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  const gapMap = {
    sm: 'gap-3',
    md: 'gap-6',
    lg: 'gap-8',
  };

  if (!isLoading && properties.length === 0) {
    return (
      <EmptyState
        title="No properties found"
        description="Try adjusting your search filters or browse all available properties."
        icon={<Search className="w-8 h-8" />}
      />
    );
  }

  return (
    <div className={`grid grid-cols-1 ${colsMap[columns]} ${gapMap[gap]}`}>
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          isBookmarked={bookmarkedIds.has(property.id)}
          onBookmarkClick={() => onBookmark?.(property.id)}
        />
      ))}
    </div>
  );
};
