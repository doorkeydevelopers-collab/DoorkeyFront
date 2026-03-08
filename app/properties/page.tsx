'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/custom/Header';
import { Footer } from '@/components/custom/Footer';
import { PropertyCard } from '@/components/custom/PropertyCard';
import { PropertyGridSkeleton } from '@/components/custom/PropertyCardSkeleton';
import { CITIES, LOCALITIES } from '@/services/mockData';
import { PROPERTY_CONFIG } from '@/constants/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { Filter, X } from 'lucide-react';
import axios from 'axios';
import { Property } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function PropertiesContent() {
  const searchParams = useSearchParams();
  const [selectedCity, setSelectedCity] = useState(
    searchParams.get('city') || ''
  );
  const [selectedLocality, setSelectedLocality] = useState('');
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );
  const [priceRange, setPriceRange] = useState([0, 100000000]);
  const [areaRange, setAreaRange] = useState([0, 1000000]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [bookmarkedProperties, setBookmarkedProperties] = useState<Set<string>>(
    new Set()
  );
  const [showFilters, setShowFilters] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('bookmarked_properties');
    if (savedBookmarks) {
      try {
        const bookmarkIds = JSON.parse(savedBookmarks);
        setBookmarkedProperties(new Set(bookmarkIds));
      } catch (e) {
        console.error('Failed to parse bookmarks:', e);
      }
    }
  }, []);

  // Fetch properties from backend with filters
  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        
        if (selectedCity) params.append('city', selectedCity);
        if (selectedTypes.length > 0) {
          selectedTypes.forEach(type => params.append('type', type));
        }
        if (priceRange[0] > 0) params.append('minPrice', priceRange[0].toString());
        if (priceRange[1] < 100000000) params.append('maxPrice', priceRange[1].toString());
        if (areaRange[0] > 0) params.append('minArea', areaRange[0].toString());
        if (areaRange[1] < 1000000) params.append('maxArea', areaRange[1].toString());
        if (searchQuery) params.append('search', searchQuery);
        
        params.append('limit', '100');

        const response = await axios.get(`${API_BASE_URL}/properties?${params.toString()}`, {
          withCredentials: true,
        });

        // Transform backend response to frontend Property type
        const transformedProperties: Property[] = (response.data.properties || []).map(
          (prop: any, idx: number) => ({
            id: prop.id,
            title: prop.title || prop.name,
            description: prop.description || '',
            type: prop.type,
            status: prop.status || 'available',
            ownerId: prop.ownerId,
            ownerName: prop.ownerName || 'Property Owner',
            price: prop.price,
            area: prop.area || 0,
            address: prop.address || '',
            city: prop.city || prop.location || '',
            locality: prop.locality || '',
            state: prop.state || '',
            zipCode: prop.zipCode || prop.pincode || '',
            bedrooms: prop.bedrooms,
            bathrooms: prop.bathrooms,
            amenities: prop.amenities || [],
            images: (prop.images || []).map((url: string, imgIdx: number) => ({
              id: `${prop.id}-${imgIdx}`,
              url,
              alt: `${prop.title} - Image ${imgIdx + 1}`,
              isPrimary: imgIdx === 0,
            })),
            isFeatured: prop.isFeatured || false,
            createdAt: prop.createdAt,
            updatedAt: prop.updatedAt,
          })
        );

        setProperties(transformedProperties);
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || 'Failed to load properties';
        setError(errorMessage);
        console.error('Properties fetch error:', err);
        setProperties([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [selectedCity, selectedTypes, priceRange, areaRange, searchQuery]);

  // Client-side filtering for amenities (can be optimized with backend support)
  const filteredProperties = properties.filter((property) => {
    if (selectedLocality && property.locality !== selectedLocality) {
      return false;
    }
    if (
      selectedAmenities.length > 0 &&
      !selectedAmenities.every((amenity) => property.amenities.includes(amenity))
    ) {
      return false;
    }
    return true;
  });

  // Handler functions
  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleBookmark = (propertyId: string) => {
    setBookmarkedProperties((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      // Save to localStorage
      localStorage.setItem(
        'bookmarked_properties',
        JSON.stringify(Array.from(newSet))
      );
      return newSet;
    });
  };

  const clearFilters = () => {
    setSelectedCity('');
    setSelectedLocality('');
    setSearchQuery('');
    setPriceRange([0, 100000000]);
    setAreaRange([0, 1000000]);
    setSelectedTypes([]);
    setSelectedAmenities([]);
  };

  const activeFiltersCount = [
    selectedCity,
    selectedLocality,
    searchQuery,
    selectedTypes.length > 0,
    selectedAmenities.length > 0,
    priceRange[0] > 0 || priceRange[1] < 100000000,
    areaRange[0] > 0 || areaRange[1] < 1000000,
  ].filter(Boolean).length;

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* City */}
      <div>
        <Label className="text-base font-semibold mb-3 block">City</Label>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="w-full h-10 px-3 rounded-md border border-input bg-background"
        >
          <option value="">All Cities</option>
          {CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* Locality */}
      {selectedCity && (
        <div>
          <Label className="text-base font-semibold mb-3 block">Locality</Label>
          <select
            value={selectedLocality}
            onChange={(e) => setSelectedLocality(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-input bg-background"
          >
            <option value="">All Localities</option>
            {LOCALITIES[selectedCity]?.map((locality) => (
              <option key={locality} value={locality}>
                {locality}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Price Range */}
      <div>
        <Label className="text-base font-semibold mb-3 block">Price Range</Label>
        <div className="space-y-4">
          <Slider
            defaultValue={priceRange}
            max={100000000}
            step={100000}
            onValueChange={setPriceRange}
            className="w-full"
          />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              ₹{(priceRange[0] / 100000).toFixed(1)}L
            </span>
            <span className="text-muted-foreground">
              ₹{(priceRange[1] / 1000000).toFixed(1)}Cr
            </span>
          </div>
        </div>
      </div>

      {/* Area Range */}
      <div>
        <Label className="text-base font-semibold mb-3 block">
          Area (sqft)
        </Label>
        <div className="space-y-4">
          <Slider
            defaultValue={areaRange}
            max={1000000}
            step={10000}
            onValueChange={setAreaRange}
            className="w-full"
          />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {areaRange[0].toLocaleString()}
            </span>
            <span className="text-muted-foreground">
              {areaRange[1].toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Property Type */}
      <div>
        <Label className="text-base font-semibold mb-3 block">
          Property Type
        </Label>
        <div className="space-y-3">
          {PROPERTY_CONFIG.PROPERTY_TYPES.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <Checkbox
                id={type.value}
                checked={selectedTypes.includes(type.value)}
                onCheckedChange={() => handleTypeToggle(type.value)}
              />
              <Label htmlFor={type.value} className="font-normal cursor-pointer">
                {type.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <Label className="text-base font-semibold mb-3 block">Amenities</Label>
        <div className="space-y-3 max-h-40 overflow-y-auto">
          {PROPERTY_CONFIG.AMENITIES.map((amenity) => (
            <div key={amenity} className="flex items-center space-x-2">
              <Checkbox
                id={amenity}
                checked={selectedAmenities.includes(amenity)}
                onCheckedChange={() => handleAmenityToggle(amenity)}
              />
              <Label htmlFor={amenity} className="font-normal cursor-pointer">
                {amenity}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Search Properties</h1>
            <p className="text-muted-foreground">
              {isLoading ? (
                'Loading properties...'
              ) : error ? (
                `Error: ${error}`
              ) : (
                <>
                  Found {filteredProperties.length} properties
                  {activeFiltersCount > 0 && ` with ${activeFiltersCount} active filter${activeFiltersCount > 1 ? 's' : ''}`}
                </>
              )}
            </p>
          </div>

          {/* Mobile Filter Toggle */}
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="mt-8 space-y-6">
                <FilterPanel />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Desktop Filters */}
          <Card className="hidden md:block h-fit md:col-span-1 sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Filters
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                  >
                    <X size={16} />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FilterPanel />
            </CardContent>
          </Card>

          {/* Properties Grid */}
          <div className="md:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <PropertyGridSkeleton key={i} count={1} />
                ))}
              </div>
            ) : error ? (
              <Card className="col-span-full">
                <CardContent className="text-center py-12">
                  <p className="text-lg text-red-600 mb-2">Error loading properties</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </CardContent>
              </Card>
            ) : filteredProperties.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="text-center py-12">
                  <p className="text-lg text-muted-foreground mb-2">
                    No properties found
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters to find more properties
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isBookmarked={bookmarkedProperties.has(property.id)}
                    onBookmarkClick={handleBookmark}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<PropertyGridSkeleton count={12} />}>
      <PropertiesContent />
    </Suspense>
  );
}
