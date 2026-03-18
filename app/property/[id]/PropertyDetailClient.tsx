'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/custom/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Heart,
  Share2,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Property } from '@/types';

interface Props {
  property: Property | null;
  error?: string | null;
}

export default function PropertyDetailClient({ property, error }: Props) {
  const router = useRouter();
  // We don't strictly need params anymore but we need propertyId
  const propertyId = (property as any)?._id || (property as any)?.id || '';

  const [selectedImage, setSelectedImage] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('bookmarked_properties');
    if (savedBookmarks) {
      try {
        const bookmarkIds = JSON.parse(savedBookmarks);
        setIsBookmarked(bookmarkIds.includes(propertyId));
      } catch (e) {
        console.error('Failed to parse bookmarks:', e);
      }
    }
  }, [propertyId]);

  // (Removed client-side fetching)

  // Removed isLoading condition because it's SSR now
  
  if (error || !property) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 max-w-7xl py-12">
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
              <h1 className="text-2xl font-bold mb-2">Property Not Found</h1>
              <p className="text-muted-foreground mb-6">
                {error || "The property you're looking for doesn't exist or has been removed."}
              </p>
              <Button onClick={() => router.push('/properties')}>
                Back to Properties
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(property.price);

  const pricePerSqft = property.area
    ? Math.round(property.price / property.area)
    : 0;

  const handleBookmark = () => {
    const newBookmarked = !isBookmarked;
    setIsBookmarked(newBookmarked);

    // Update localStorage
    try {
      const savedBookmarks = localStorage.getItem('bookmarked_properties');
      let bookmarkIds: string[] = [];

      if (savedBookmarks) {
        bookmarkIds = JSON.parse(savedBookmarks);
      }

      if (newBookmarked) {
        if (!bookmarkIds.includes(propertyId)) {
          bookmarkIds.push(propertyId);
        }
      } else {
        bookmarkIds = bookmarkIds.filter((id) => id !== propertyId);
      }

      localStorage.setItem('bookmarked_properties', JSON.stringify(bookmarkIds));
    } catch (e) {
      console.error('Failed to update bookmarks:', e);
    }

    toast.success(
      newBookmarked ? 'Added to bookmarks' : 'Removed from bookmarks'
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out this ${property.type} property on DoorKey`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          ← Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative w-full h-96 bg-muted">
                {property.images[selectedImage] && (
                  <Image
                    src={property.images[selectedImage].url}
                    alt={property.images[selectedImage].alt}
                    fill
                    className="object-cover"
                    priority
                  />
                )}

                {/* Featured Badge */}
                {property.isFeatured && (
                  <Badge className="absolute top-4 left-4 bg-primary text-white">
                    Featured
                  </Badge>
                )}

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={handleBookmark}
                    className="bg-white/90 hover:bg-white"
                  >
                    <Heart
                      size={20}
                      className={
                        isBookmarked
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-600'
                      }
                    />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={handleShare}
                    className="bg-white/90 hover:bg-white"
                  >
                    <Share2 size={20} className="text-gray-600" />
                  </Button>
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {property.images.length > 1 && (
                <CardContent className="p-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {property.images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImage(index)}
                        className={`relative w-20 h-20 rounded-md overflow-hidden shrink-0 border-2 transition-colors ${
                          selectedImage === index
                            ? 'border-primary'
                            : 'border-muted'
                        }`}
                      >
                        <Image
                          src={image.url}
                          alt={image.alt}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <h1 className="text-3xl font-bold">{property.title}</h1>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin size={18} />
                        <span>
                          {property.locality}, {property.city}
                          {property.state && `, ${property.state}`}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize text-lg px-3 py-1">
                      {property.status}
                    </Badge>
                  </div>

                  {/* Price Section */}
                  <div className="space-y-1 border-t pt-4">
                    <p className="text-4xl font-bold text-primary">
                      {formattedPrice}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ₹{pricePerSqft.toLocaleString('en-IN')}/sqft
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Key Features */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {property.bedrooms !== undefined && (
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <BedDouble className="text-primary" size={20} />
                        <span className="font-semibold">Bedrooms</span>
                      </div>
                      <p className="text-2xl font-bold">{property.bedrooms}</p>
                    </div>
                  )}

                  {property.bathrooms !== undefined && (
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Bath className="text-primary" size={20} />
                        <span className="font-semibold">Bathrooms</span>
                      </div>
                      <p className="text-2xl font-bold">{property.bathrooms}</p>
                    </div>
                  )}

                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Maximize2 className="text-primary" size={20} />
                      <span className="font-semibold">Area</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {property.area.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">sqft</p>
                  </div>

                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="text-primary" size={20} />
                      <span className="font-semibold">Listed</span>
                    </div>
                    <p className="text-sm font-bold">
                      {new Date(property.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Details Tabs */}
                <Tabs defaultValue="description" className="w-full">
                  <TabsList>
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="amenities">Amenities</TabsTrigger>
                    <TabsTrigger value="location">Location</TabsTrigger>
                  </TabsList>

                  <TabsContent value="description" className="space-y-4 mt-4">
                    <p className="text-base leading-relaxed">
                      {property.description}
                    </p>

                    {property.address && (
                      <div>
                        <h3 className="font-semibold mb-2">Full Address</h3>
                        <p className="text-muted-foreground">
                          {property.address}
                          {property.zipCode && `, ${property.zipCode}`}
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="amenities" className="space-y-4 mt-4">
                    {property.amenities.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {property.amenities.map((amenity) => (
                          <div
                            key={amenity}
                            className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20"
                          >
                            <CheckCircle
                              size={18}
                              className="text-primary shrink-0"
                            />
                            <span className="text-sm font-medium">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No amenities listed
                      </p>
                    )}
                  </TabsContent>

                  <TabsContent value="location" className="space-y-4 mt-4">
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">
                        Location map feature coming soon
                      </p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-semibold">City:</span> {property.city}
                      </p>
                      <p>
                        <span className="font-semibold">Locality:</span>{' '}
                        {property.locality}
                      </p>
                      {property.state && (
                        <p>
                          <span className="font-semibold">State:</span>{' '}
                          {property.state}
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Owner Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Name</p>
                  <p className="font-semibold">{property.ownerName}</p>
                </div>

                <div className="space-y-3">
                  <Button className="w-full bg-primary hover:bg-primary/90 gap-2 h-10">
                    <Phone size={18} />
                    Contact Owner
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2 h-10"
                  >
                    <Mail size={18} />
                    Send Message
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Click to reveal contact details
                </p>
              </CardContent>
            </Card>

            {/* Property Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Property Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-semibold capitalize">
                    {property.type}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-4">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className="capitalize">
                    {property.status}
                  </Badge>
                </div>
                <div className="flex justify-between border-t pt-4">
                  <span className="text-muted-foreground">Listed on</span>
                  <span className="font-semibold">
                    {new Date(property.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Report Ad Card */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  variant="outline"
                  className="w-full text-destructive hover:text-destructive"
                >
                  Report This Property
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
