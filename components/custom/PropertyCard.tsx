'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Property } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, BedDouble, Bath, Maximize2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PropertyCardProps {
  property: Property;
  isBookmarked?: boolean;
  onBookmarkClick?: (propertyId: string) => void;
}

export function PropertyCard({
  property,
  isBookmarked = false,
  onBookmarkClick,
}: PropertyCardProps) {
  const primaryImage = property.images[0];
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(property.price);

  return (
    <Link href={`/property/${property.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full cursor-pointer">
        {/* Image Container */}
        <div className="relative w-full h-48 overflow-hidden bg-muted">
          {primaryImage && (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          )}

          {/* Featured Badge */}
          {property.isFeatured && (
            <Badge className="absolute top-3 left-3 bg-primary text-white">
              Featured
            </Badge>
          )}

          {/* Status Badge */}
          <Badge
            variant="outline"
            className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm"
          >
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </Badge>

          {/* Bookmark Button */}
          <Button
            size="icon"
            variant="ghost"
            className="absolute bottom-3 right-3 bg-white/90 hover:bg-white"
            onClick={(e) => {
              e.preventDefault();
              onBookmarkClick?.(property.id);
            }}
          >
            <Heart
              size={20}
              className={isBookmarked ? 'fill-red-500 text-red-500' : 'text-gray-600'}
            />
          </Button>
        </div>

        {/* Content */}
        <CardContent className="p-4 space-y-3">
          {/* Title */}
          <div className="space-y-1">
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin size={16} />
              <span className="line-clamp-1">
                {property.locality}, {property.city}
              </span>
            </div>
          </div>

          {/* Features */}
          {(property.bedrooms || property.bathrooms || property.area) && (
            <div className="flex gap-4 text-sm text-muted-foreground py-2 border-y">
              {property.bedrooms !== undefined && (
                <div className="flex items-center gap-1">
                  <BedDouble size={16} />
                  <span>{property.bedrooms} BHK</span>
                </div>
              )}
              {property.bathrooms !== undefined && (
                <div className="flex items-center gap-1">
                  <Bath size={16} />
                  <span>{property.bathrooms}</span>
                </div>
              )}
              {property.area && (
                <div className="flex items-center gap-1">
                  <Maximize2 size={16} />
                  <span>{property.area.toLocaleString()} sqft</span>
                </div>
              )}
            </div>
          )}

          {/* Price */}
          <div className="space-y-1">
            <p className="text-2xl font-bold text-primary">{formattedPrice}</p>
            <p className="text-xs text-muted-foreground">
              ₹{(property.price / property.area).toLocaleString('en-IN', {
                maximumFractionDigits: 0,
              })}/sqft
            </p>
          </div>

          {/* Property Type */}
          <Badge variant="secondary" className="w-fit capitalize">
            {property.type}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
