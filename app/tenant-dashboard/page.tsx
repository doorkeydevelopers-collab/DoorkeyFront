'use client';

import React, { useState } from 'react';
import { Header } from '@/components/custom/Header';
import { ProtectedRoute } from '@/components/custom/ProtectedRoute';
import { PropertyCard } from '@/components/custom/PropertyCard';
import { MOCK_PROPERTIES } from '@/services/mockData';
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

export default function TenantDashboardPage() {
  const [bookmarks, setBookmarks] = useState<Set<string>>(
    new Set(['1', '2', '3'])
  );
  const [searchFilter, setSearchFilter] = useState('');

  const bookmarkedProperties = MOCK_PROPERTIES.filter((p) =>
    bookmarks.has(p.id)
  ).filter(
    (p) =>
      searchFilter === '' ||
      p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.locality.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleRemoveBookmark = (propertyId: string) => {
    setBookmarks((prev) => {
      const newSet = new Set(prev);
      newSet.delete(propertyId);
      return newSet;
    });
    toast.success('Removed from bookmarks');
  };

  const stats = [
    {
      label: 'Saved Properties',
      value: bookmarks.size,
      icon: Heart,
    },
    {
      label: 'Recently Viewed',
      value: '5',
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
              {bookmarkedProperties.length === 0 ? (
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
                    {bookmarkedProperties.length} property(ies) saved
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookmarkedProperties.map((property) => (
                      <div key={property.id} className="relative">
                        <PropertyCard
                          property={property}
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
            <CardHeader>
              <CardTitle>Search History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  '2 BHK in Bandra, Mumbai',
                  'Residential property in Bangalore',
                  'Commercial space in Downtown Mumbai',
                  'Residential in Pune',
                ].map((search, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin size={18} className="text-muted-foreground" />
                      <span className="text-sm">{search}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        toast.success(
                          `Loading search: ${search}`
                        )
                      }
                    >
                      Search
                    </Button>
                  </div>
                ))}
              </div>
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
