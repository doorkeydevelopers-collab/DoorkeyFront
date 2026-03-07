'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { CITIES, PROPERTY_TYPES } from '@/services/mockData';

export interface FilterState {
  search: string;
  city: string;
  propertyType: string;
  minPrice: number;
  maxPrice: number;
  minArea: number;
  maxArea: number;
}

interface PropertyFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
}

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    onFilterChange({
      ...filters,
      [name]:
        name.startsWith('min') || name.startsWith('max')
          ? parseFloat(value) || 0
          : value,
    });
  };

  const isFiltered = Object.values(filters).some(
    (val) => val !== '' && val !== 0
  );

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-xs"
            >
              <X size={14} className="mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div>
          <Label htmlFor="search" className="text-sm font-medium mb-2 block">
            Search
          </Label>
          <Input
            id="search"
            name="search"
            type="text"
            placeholder="Property name or locality..."
            value={filters.search}
            onChange={handleInputChange}
            className="h-9"
          />
        </div>

        {/* City */}
        <div>
          <Label htmlFor="city" className="text-sm font-medium mb-2 block">
            City
          </Label>
          <select
            id="city"
            name="city"
            value={filters.city}
            onChange={handleInputChange}
            className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="">All Cities</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Property Type */}
        <div>
          <Label htmlFor="propertyType" className="text-sm font-medium mb-2 block">
            Property Type
          </Label>
          <select
            id="propertyType"
            name="propertyType"
            value={filters.propertyType}
            onChange={handleInputChange}
            className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="">All Types</option>
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Price Range (₹)</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                name="minPrice"
                type="number"
                placeholder="Min price"
                value={filters.minPrice || ''}
                onChange={handleInputChange}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Input
                name="maxPrice"
                type="number"
                placeholder="Max price"
                value={filters.maxPrice || ''}
                onChange={handleInputChange}
                className="h-9 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Area Range */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Area (sq ft)</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                name="minArea"
                type="number"
                placeholder="Min area"
                value={filters.minArea || ''}
                onChange={handleInputChange}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Input
                name="maxArea"
                type="number"
                placeholder="Max area"
                value={filters.maxArea || ''}
                onChange={handleInputChange}
                className="h-9 text-sm"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
