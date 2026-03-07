'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PropertyCard } from '@/components/custom/PropertyCard';
import { PropertyGridSkeleton } from '@/components/custom/PropertyCardSkeleton';
import { Header } from '@/components/custom/Header';
import { Footer } from '@/components/custom/Footer';
import { MOCK_PROPERTIES, CITIES } from '@/services/mockData';
import { useDebounce } from '@/hooks/useDebounce';
import { ArrowRight, Search, MapPin, Building2, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [bookmarkedProperties, setBookmarkedProperties] = useState<Set<string>>(
    new Set()
  );

  const featuredProperties = MOCK_PROPERTIES.filter((p) => p.isFeatured);

  useEffect(() => {
    // Simulate loading state
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [debouncedSearch, selectedCity]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.append('search', debouncedSearch);
    if (selectedCity) params.append('city', selectedCity);
    router.push(`/properties?${params.toString()}`);
  };

  const handleBookmark = (propertyId: string) => {
    setBookmarkedProperties((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 bg-gradient-to-br from-primary/10 via-background to-background overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-5" />
        
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="max-w-2xl mx-auto text-center space-y-6 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Find Your Perfect{' '}
              <span className="bg-gradient-to-r from-primary to-sky-600 bg-clip-text text-transparent">
                Property
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Discover thousands of premium properties across residential, commercial, industrial, and agricultural categories. Connect with property owners and find your dream home today.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Search Input */}
                  <div className="md:col-span-2">
                    <Input
                      placeholder="Search properties, locations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="h-12 text-base"
                    />
                  </div>

                  {/* City Select */}
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="h-12 px-4 rounded-md border border-input bg-background text-base"
                  >
                    <option value="">All Cities</option>
                    {CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>

                  {/* Search Button */}
                  <Button
                    onClick={handleSearch}
                    className="h-12 bg-primary hover:bg-primary/90 text-white gap-2"
                  >
                    <Search size={20} />
                    <span className="hidden sm:inline">Search</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 border-b">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Building2, label: 'Total Properties', value: '10,000+' },
              { label: 'Active Users', value: '50,000+', icon: MapPin },
              { icon: TrendingUp, label: 'Success Rate', value: '98%' },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <Icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      {stat.value}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Featured Properties
              </h2>
              <p className="text-muted-foreground">
                Handpicked premium properties listed on our platform
              </p>
            </div>
            <Link href="/properties">
              <Button variant="outline" className="hidden sm:flex gap-2">
                View All
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <PropertyGridSkeleton count={6} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isBookmarked={bookmarkedProperties.has(property.id)}
                  onBookmarkClick={handleBookmark}
                />
              ))}
            </div>
          )}

          {/* Mobile View All Button */}
          <div className="mt-8 sm:hidden">
            <Link href="/properties" className="w-full block">
              <Button className="w-full bg-primary hover:bg-primary/90 h-12">
                View All Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-primary/5 to-sky-500/5 border-y">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to List Your Property?
              </h2>
              <p className="text-lg text-muted-foreground">
                Join thousands of property owners who have successfully listed and rented their properties on DoorKey. Easy listing process, zero commission, maximum visibility.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                    Start Listing Today
                  </Button>
                </Link>
                <Link href="/properties">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Browse Properties
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'Easy Upload', desc: 'Upload properties in minutes' },
                { title: '24/7 Support', desc: 'Round the clock customer support' },
                { title: 'Verified Users', desc: 'Connect with verified buyers' },
                { title: 'Analytics', desc: 'Track listing performance' },
              ].map((feature, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
