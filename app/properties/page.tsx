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
import { PropertyMap } from '@/components/custom/PropertyMap';
import { Filter, X, LayoutGrid, Map as MapIcon, Bell, BellRing } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Property } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function PropertiesContent() {
  const searchParams = useSearchParams();
  const { user, submitOwnerApplication } = useAuth();
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
  const [showOwnerDialog, setShowOwnerDialog] = useState(false);
  const [isOwnerLoading, setIsOwnerLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showSaveSearch, setShowSaveSearch] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [saveSearchFrequency, setSaveSearchFrequency] = useState<'daily' | 'weekly'>('daily');
  const [isSavingSearch, setIsSavingSearch] = useState(false);

  const ownerForm = useForm({
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      experience: '',
      propertiesCount: '',
      reason: '',
    },
  });

  // Debounce only continuous inputs (text, sliders) — discrete selectors don't need it
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedPriceRange = useDebounce(priceRange, 300);
  const debouncedAreaRange = useDebounce(areaRange, 300);

  // Handler for owner application
  const handleOwnerApplication = async (data: any) => {
    if (!submitOwnerApplication) return;

    setIsOwnerLoading(true);
    try {
      await submitOwnerApplication(data);
      setShowOwnerDialog(false);
      ownerForm.reset();
    } catch (error) {
      console.error('Owner application error:', error);
    } finally {
      setIsOwnerLoading(false);
    }
  };

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
          selectedTypes.forEach((type: string) => params.append('type', type));
        }
        if (debouncedPriceRange[0] > 0) params.append('minPrice', debouncedPriceRange[0].toString());
        if (debouncedPriceRange[1] < 100000000) params.append('maxPrice', debouncedPriceRange[1].toString());
        if (debouncedAreaRange[0] > 0) params.append('minArea', debouncedAreaRange[0].toString());
        if (debouncedAreaRange[1] < 1000000) params.append('maxArea', debouncedAreaRange[1].toString());
        if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
        if (selectedLocality) params.append('locality', selectedLocality);
        if (selectedAmenities.length > 0) {
          params.append('amenities', selectedAmenities.join(','));
        }

        const response = await axios.get(`${API_BASE_URL}/properties?${params.toString()}`, {
          withCredentials: true,
        });

        // Transform backend response to frontend Property type
        const transformedProperties: Property[] = (response.data.properties || []).map(
          (prop: any, idx: number) => ({
            id: prop._id,
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
            coordinates: prop.coordinates || null,
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
  }, [selectedCity, selectedTypes, debouncedPriceRange, debouncedAreaRange, debouncedSearchQuery, selectedLocality, selectedAmenities]);

  // Client-side filtering for amenities (can be optimized with backend support)
  const filteredProperties = properties;

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

  const handleSaveSearch = async () => {
    if (!user) {
      toast.error('Please login to save a search');
      return;
    }
    setIsSavingSearch(true);
    try {
      const token = localStorage.getItem('doorkey_auth_token');
      await axios.post(
        `${API_BASE_URL}/saved-searches`,
        {
          name: saveSearchName || 'My Search',
          email: user.email,
          frequency: saveSearchFrequency,
          filters: {
            city: selectedCity,
            locality: selectedLocality,
            type: selectedTypes,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
            minArea: areaRange[0],
            maxArea: areaRange[1],
            amenities: selectedAmenities,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      toast.success('Search saved! You\'ll receive email alerts for matching properties.');
      setShowSaveSearch(false);
      setSaveSearchName('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save search');
    } finally {
      setIsSavingSearch(false);
    }
  };

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
    <>
      <div className="min-h-screen bg-background">
        <Header />

      {/* Become Owner Banner */}
      {user?.role !== 'owner' && user?.role !== 'admin' && (
      <div className="bg-linear-to-r from-blue-50 to-indigo-50 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Want to List Your Property?
              </h2>
              <p className="text-gray-600">
                Join our platform as a property owner and start listing your properties today.
              </p>
            </div>
            <Button onClick={() => setShowOwnerDialog(true)} className="bg-primary hover:bg-primary/90">
              Become an Owner
            </Button>
          </div>
        </div>
      </div>
      )}

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
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Save Search Button */}
            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSaveSearch(true)}
                className="hidden sm:flex items-center gap-2 border-primary/20 hover:bg-primary/5 text-primary"
              >
                <BellRing size={16} />
                Save Search
              </Button>
            )}

            {/* View Toggle + Filters */}
            <div className="flex items-center border rounded-lg overflow-hidden ml-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-none gap-1"
              >
                <LayoutGrid size={16} />
                Grid
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
                className="rounded-none gap-1"
              >
                <MapIcon size={16} />
                Map
              </Button>
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
                  {FilterPanel()}
                </div>
              </SheetContent>
            </Sheet>
          </div>
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
              {FilterPanel()}
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

            {/* Map View */}
            {viewMode === 'map' && !isLoading && !error && (
              <PropertyMap
                properties={filteredProperties.map(p => ({
                  id: p.id,
                  title: p.title,
                  price: p.price,
                  type: p.type,
                  city: p.city,
                  locality: p.locality,
                  bedrooms: p.bedrooms,
                  bathrooms: p.bathrooms,
                  area: p.area,
                  images: p.images.map(img => img.url),
                  coordinates: (p as any).coordinates || undefined,
                }))}
              />
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* Save Search Dialog */}
      <Dialog open={showSaveSearch} onOpenChange={setShowSaveSearch}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Search</DialogTitle>
            <DialogDescription>
              We'll send you an email when new properties match your filters.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="search-name">Give this search a name</Label>
              <Input
                id="search-name"
                placeholder="e.g. 2BHK in Indiranagar"
                value={saveSearchName}
                onChange={(e) => setSaveSearchName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Email Frequency</Label>
              <select
                id="frequency"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={saveSearchFrequency}
                onChange={(e) => setSaveSearchFrequency(e.target.value as 'daily' | 'weekly')}
              >
                <option value="daily">Daily digest</option>
                <option value="weekly">Weekly digest</option>
              </select>
            </div>
            <div className="bg-muted/50 p-3 rounded-md mt-2">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Filter className="h-4 w-4" /> Active Filters
              </h4>
              <ul className="text-xs space-y-1 text-muted-foreground list-disc list-inside">
                {selectedCity && <li>City: {selectedCity}</li>}
                {selectedLocality && <li>Locality: {selectedLocality}</li>}
                {selectedTypes.length > 0 && <li>Types: {selectedTypes.join(', ')}</li>}
                {(priceRange[0] > 0 || priceRange[1] < 100000000) && (
                  <li>Price: {priceRange[0]} - {priceRange[1]}</li>
                )}
                {selectedAmenities.length > 0 && <li>Amenities: {selectedAmenities.length} selected</li>}
                {activeFiltersCount === 0 && <li>All properties (no active filters)</li>}
              </ul>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowSaveSearch(false)}
              disabled={isSavingSearch}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSearch}
              disabled={isSavingSearch || !saveSearchName.trim()}
              className="gap-2"
            >
              {isSavingSearch ? (
                <>
                  <Spinner size="sm" />
                  Saving...
                </>
              ) : (
                <>
                  <Bell size={16} />
                  Save Search
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>

    {/* Owner Application Dialog */}
    <Dialog open={showOwnerDialog} onOpenChange={setShowOwnerDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Become a Property Owner</DialogTitle>
          <DialogDescription>
            Fill out this form to apply for property owner status. An admin will review your application.
          </DialogDescription>
        </DialogHeader>

        <Form {...ownerForm}>
          <form
            onSubmit={ownerForm.handleSubmit(handleOwnerApplication)}
            className="space-y-4"
          >
            {/* Full Name Field */}
            <FormField
              control={ownerForm.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      disabled={isOwnerLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Number Field */}
            <FormField
              control={ownerForm.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="9876543210"
                      disabled={isOwnerLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Experience Field */}
            <FormField
              control={ownerForm.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Real Estate Experience</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 5 years in property management"
                      disabled={isOwnerLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Properties Count Field */}
            <FormField
              control={ownerForm.control}
              name="propertiesCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Properties</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      disabled={isOwnerLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reason Field */}
            <FormField
              control={ownerForm.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Why do you want to become an owner?</FormLabel>
                  <FormControl>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                      placeholder="Tell us about your interest in property listing..."
                      disabled={isOwnerLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isOwnerLoading}
            >
              {isOwnerLoading ? (
                <>
                  <Spinner className="mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
    </>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<PropertyGridSkeleton count={12} />}>
      <PropertiesContent />
    </Suspense>
  );
}
