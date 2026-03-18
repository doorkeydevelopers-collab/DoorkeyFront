import PropertyDetailClient from './PropertyDetailClient';
import { Property } from '@/types';
import { Metadata } from 'next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://doorkey.in';

async function getProperty(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/properties/${id}`, {
      next: { revalidate: 60 } // Revalidate every minute for caching
    });
    
    if (!res.ok) {
      if (res.status === 404) {
         return { property: null, error: 'Property not found' };
      }
      return { property: null, error: 'Failed to fetch property details' };
    }
    
    const backendProperty = await res.json();
    
    const transformedProperty: Property = {
      id: backendProperty._id || id,
      title: backendProperty.title || backendProperty.name,
      description: backendProperty.description || '',
      type: backendProperty.type,
      status: backendProperty.status || 'available',
      ownerId: backendProperty.ownerId,
      ownerName: backendProperty.ownerName || 'Property Owner',
      price: backendProperty.price,
      area: backendProperty.area || 0,
      address: backendProperty.address || '',
      city: backendProperty.city || backendProperty.location || '',
      locality: backendProperty.locality || '',
      state: backendProperty.state || '',
      zipCode: backendProperty.zipCode || backendProperty.pincode || '',
      bedrooms: backendProperty.bedrooms,
      bathrooms: backendProperty.bathrooms,
      amenities: backendProperty.amenities || [],
      images: (backendProperty.images || []).map((url: string, idx: number) => ({
        id: `${id}-${idx}`,
        url,
        alt: `${backendProperty.title} - Image ${idx + 1}`,
        isPrimary: idx === 0,
      })),
      isFeatured: backendProperty.isFeatured || false,
      createdAt: backendProperty.createdAt,
      updatedAt: backendProperty.updatedAt,
    };
    
    return { property: transformedProperty, error: null };
  } catch (err) {
    console.error('Server fetch error:', err);
    return { property: null, error: 'Server unavailable or network error' };
  }
}

function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

// Full SEO metadata with Open Graph + Twitter cards
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { property } = await getProperty(id);
  
  if (!property) {
    return {
      title: 'Property Not Found | DoorKey',
      description: 'The property you are looking for does not exist or has been removed.',
    };
  }
  
  const priceStr = formatPrice(property.price);
  const locationParts = [property.locality, property.city, property.state].filter(Boolean);
  const locationStr = locationParts.join(', ');
  const title = `${property.title} — ${priceStr} | DoorKey`;
  const description = property.description
    ? property.description.substring(0, 155)
    : `${property.type} property in ${locationStr}. ${property.bedrooms ? property.bedrooms + ' BHK' : ''} ${property.area ? property.area + ' sq ft' : ''} — ${priceStr}`.trim();
  
  const primaryImage = property.images?.[0]?.url || `${SITE_URL}/og-placeholder.png`;
  const propertyUrl = `${SITE_URL}/property/${id}`;

  return {
    title,
    description,
    keywords: [
      property.type,
      property.city,
      property.state,
      'property',
      'real estate',
      property.status === 'available' ? 'for rent' : 'rented',
      ...(property.amenities || []),
    ].filter((k): k is string => Boolean(k)),
    openGraph: {
      title,
      description,
      url: propertyUrl,
      siteName: 'DoorKey',
      type: 'website',
      locale: 'en_IN',
      images: [
        {
          url: primaryImage,
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [primaryImage],
    },
    alternates: {
      canonical: propertyUrl,
    },
  };
}

// JSON-LD Structured Data for Google Rich Results
function PropertyJsonLd({ property }: { property: Property }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url: `${SITE_URL}/property/${property.id}`,
    image: property.images?.map(img => img.url) || [],
    datePosted: property.createdAt,
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'INR',
      availability: property.status === 'available'
        ? 'https://schema.org/InStock'
        : 'https://schema.org/SoldOut',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: property.city,
      addressRegion: property.state,
      postalCode: property.zipCode,
      addressCountry: 'IN',
    },
    ...(property.area ? { floorSize: { '@type': 'QuantitativeValue', value: property.area, unitCode: 'FTK' } } : {}),
    ...(property.bedrooms ? { numberOfRooms: property.bedrooms } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { property, error } = await getProperty(id);
  
  return (
    <>
      {property && <PropertyJsonLd property={property} />}
      <PropertyDetailClient property={property} error={error} />
    </>
  );
}
