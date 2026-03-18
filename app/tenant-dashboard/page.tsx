'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Header } from '@/components/custom/Header';
import { ProtectedRoute } from '@/components/custom/ProtectedRoute';
import { PropertyCard } from '@/components/custom/PropertyCard';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  MapPin,
  Clock,
  Filter,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface SearchHistory {
  id: string;
  query: string;
  timestamp: number;
}

export default function TenantDashboardPage() {
  const [bookmarkedPropertyIds, setBookmarkedPropertyIds] = useState<Set<string>>(
    new Set()
  );
  const [bookmarkedProperties, setBookmarkedProperties] = useState<any[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('bookmarked_properties');
    if (savedBookmarks) {
      try {
        const bookmarkIds = JSON.parse(savedBookmarks);
        setBookmarkedPropertyIds(new Set(bookmarkIds));
      } catch (e) {
        console.error('Failed to parse bookmarks:', e);
      }
    }

    // Load search history
    const savedHistory = localStorage.getItem('search_history');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setSearchHistory(history);
      } catch (e) {
        console.error('Failed to parse search history:', e);
      }
    }
  }, []);

  // Fetch bookmarked properties from backend when bookmark IDs change
  useEffect(() => {
    if (bookmarkedPropertyIds.size === 0) {
      setBookmarkedProperties([]);
      return;
    }

    const fetchBookmarkedProperties = async () => {
      setIsLoadingProperties(true);
      try {
        // Fetch all available properties and filter by bookmarked IDs
        const response = await axios.get(`${API_BASE_URL}/properties?limit=1000`, {
          withCredentials: true,
        });

        const bookmarkedProps = (response.data.properties || []).filter(
          (p: any) => bookmarkedPropertyIds.has(p.id)
        );

        setBookmarkedProperties(bookmarkedProps);
      } catch (err: any) {
        console.error('Failed to fetch bookmarked properties:', err);
        toast.error('Failed to load bookmarked properties');
      } finally {
        setIsLoadingProperties(false);
      }
    };

    fetchBookmarkedProperties();
  }, [bookmarkedPropertyIds]);

  const handleRemoveBookmark = (propertyId: string) => {
    const newBookmarks = new Set(bookmarkedPropertyIds);
    newBookmarks.delete(propertyId);
    setBookmarkedPropertyIds(newBookmarks);

    // Save to localStorage
    localStorage.setItem(
      'bookmarked_properties',
      JSON.stringify(Array.from(newBookmarks))
    );

    toast.success('Removed from bookmarks');
  };

  const filteredProperties = bookmarkedProperties.filter(
    (p) =>
      searchFilter === '' ||
      (p.title || p.name).toLowerCase().includes(searchFilter.toLowerCase()) ||
      (p.locality || '').toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleSearchHistoryItem = (search: string) => {
    setSearchFilter(search);
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('search_history');
    toast.success('Search history cleared');
  };

  const stats = [
    {
      label: 'Saved Properties',
      value: bookmarkedPropertyIds.size,
      icon: Heart,
    },
    {
      label: 'Recently Viewed',
      value: searchHistory.length,
      icon: Clock,
    },
  ];

  return (
    <ProtectedRoute requiredRole="tenant">
      <div className="min-h-screen bg-background">
        <Header />

        <div className="container mx-auto px-4 max-w-7xl py-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Tenant Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your saved properties and search preferences
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-bold text-primary">
                          {stat.value}
                        </p>
                      </div>
                      <Icon className="h-8 w-8 text-primary/30" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Bookmarks Section */}
          <Card>
            <CardHeader>
              <CardTitle>Saved Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search Filter */}
              <div className="flex gap-2">
                <Input
                  placeholder="Search saved properties..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="icon">
                  <Filter size={20} />
                </Button>
              </div>

              {/* Bookmarks Grid */}
              {isLoadingProperties ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner />
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-semibold mb-2">
                    No saved properties
                  </p>
                  <p className="text-muted-foreground">
                    Start exploring and save properties you're interested in
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    {filteredProperties.length} property(ies) saved
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProperties.map((property) => (
                      <div key={property.id} className="relative">
                        <PropertyCard
                          property={{
                            id: property.id,
                            title: property.title || property.name,
                            description: property.description || '',
                            type: property.type,
                            status: property.status || 'available',
                            ownerId: property.ownerId,
                            ownerName: property.ownerName || 'Property Owner',
                            price: property.price,
                            area: property.area || 0,
                            address: property.address || '',
                            city: property.city || property.location || '',
                            locality: property.locality || '',
                            state: property.state || '',
                            zipCode: property.zipCode || property.pincode || '',
                            bedrooms: property.bedrooms,
                            bathrooms: property.bathrooms,
                            amenities: property.amenities || [],
                            images: (property.images || []).map((url: string, idx: number) => ({
                              id: `${property.id}-${idx}`,
                              url,
                              alt: `${property.title} - Image ${idx + 1}`,
                              isPrimary: idx === 0,
                            })),
                            isFeatured: property.isFeatured || false,
                            createdAt: property.createdAt,
                            updatedAt: property.updatedAt,
                          }}
                          isBookmarked={true}
                          onBookmarkClick={() =>
                            handleRemoveBookmark(property.id)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Search History Section */}
          <Card className="mt-8">
            <CardHeader className="flex items-center justify-between flex-row">
              <CardTitle>Search History</CardTitle>
              {searchHistory.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearchHistory}
                  className="h-8 px-2"
                >
                  Clear History
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {searchHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No search history yet. Start searching to see your history here.
                </p>
              ) : (
                <div className="space-y-3">
                  {searchHistory.slice(0, 5).map((search) => (
                    <div
                      key={search.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin size={18} className="text-muted-foreground" />
                        <span className="text-sm">{search.query}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSearchHistoryItem(search.query)}
                      >
                        Search
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alerts Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Property Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                Create alerts to get notified when new properties matching your preferences are listed.
              </p>
              <Button className="bg-primary hover:bg-primary/90">
                Create Alert
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
