'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Maximize } from 'lucide-react';

// Dynamically import Leaflet only on client
let L: typeof import('leaflet') | null = null;

interface MapProperty {
  id: string;
  title: string;
  price: number;
  type: string;
  city: string;
  locality: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: number;
  images: string[];
  coordinates?: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
}

interface PropertyMapProps {
  properties: MapProperty[];
  className?: string;
}

function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(0)}L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

// Default center (India center)
const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

export function PropertyMap({ properties, className = '' }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Dynamic import for Leaflet (client-side only)
    import('leaflet').then((leaflet) => {
      L = leaflet.default || leaflet;

      // Inject leaflet CSS via link tag
      if (!document.querySelector('link[href*=\"leaflet\"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      setIsReady(true);
    });
  }, []);

  useEffect(() => {
    if (!isReady || !L || !mapRef.current || mapInstanceRef.current) return;

    // Filter properties with valid coordinates
    const geoProperties = properties.filter(
      (p) =>
        p.coordinates &&
        p.coordinates.coordinates &&
        p.coordinates.coordinates[0] !== 0 &&
        p.coordinates.coordinates[1] !== 0
    );

    // Determine center
    let center = DEFAULT_CENTER;
    let zoom = DEFAULT_ZOOM;

    if (geoProperties.length > 0) {
      const lats = geoProperties.map((p) => p.coordinates!.coordinates[1]);
      const lngs = geoProperties.map((p) => p.coordinates!.coordinates[0]);
      center = [
        (Math.min(...lats) + Math.max(...lats)) / 2,
        (Math.min(...lngs) + Math.max(...lngs)) / 2,
      ];
      zoom = 10;
    }

    // Initialize map
    const map = L.map(mapRef.current).setView(center, zoom);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    // Custom marker icon
    const markerIcon = L.divIcon({
      className: 'custom-map-marker',
      html: '<div style="background:#0ea5e9;color:#fff;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:600;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid #fff;"></div>',
      iconSize: [80, 30],
      iconAnchor: [40, 30],
    });

    // Add markers
    geoProperties.forEach((property) => {
      const [lng, lat] = property.coordinates!.coordinates;
      const priceStr = formatPrice(property.price);

      const icon = L!.divIcon({
        className: 'custom-map-marker',
        html: `<div style="background:#0ea5e9;color:#fff;padding:4px 10px;border-radius:8px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 2px 10px rgba(0,0,0,0.25);border:2px solid #fff;cursor:pointer;transform:translateX(-50%);">${priceStr}</div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 30],
      });

      const marker = L!.marker([lat, lng], { icon }).addTo(map);

      // Popup content
      const popupContent = `
        <div style="width:240px;font-family:system-ui,sans-serif;">
          ${property.images[0] ? `<img src="${property.images[0]}" alt="${property.title}" style="width:100%;height:120px;object-fit:cover;border-radius:8px 8px 0 0;" />` : ''}
          <div style="padding:10px;">
            <h3 style="margin:0 0 4px;font-size:14px;font-weight:600;">${property.title}</h3>
            <p style="margin:0 0 6px;font-size:12px;color:#666;">
              ${property.locality ? property.locality + ', ' : ''}${property.city}
            </p>
            <div style="display:flex;gap:10px;font-size:11px;color:#888;margin-bottom:8px;">
              ${property.bedrooms ? `<span>${property.bedrooms} Bed</span>` : ''}
              ${property.bathrooms ? `<span>${property.bathrooms} Bath</span>` : ''}
              ${property.area ? `<span>${property.area} sqft</span>` : ''}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:16px;font-weight:700;color:#0ea5e9;">${priceStr}</span>
              <a href="/property/${property.id}" style="font-size:12px;color:#0ea5e9;text-decoration:none;font-weight:500;">View →</a>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 260,
        className: 'property-map-popup',
      });
    });

    // If we have geo properties, fit bounds
    if (geoProperties.length > 1) {
      const bounds = L.latLngBounds(
        geoProperties.map((p) => [
          p.coordinates!.coordinates[1],
          p.coordinates!.coordinates[0],
        ] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isReady, properties]);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapRef}
        className="w-full h-[500px] rounded-xl border overflow-hidden z-0"
        style={{ background: '#f1f5f9' }}
      />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-xl">
          <p className="text-muted-foreground text-sm">Loading map...</p>
        </div>
      )}
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          padding: 0 !important;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
        .leaflet-popup-tip {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </div>
  );
}
