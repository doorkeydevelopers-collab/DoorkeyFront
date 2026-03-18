import { NextRequest, NextResponse } from 'next/server';
import { MOCK_PROPERTIES } from '@/services/mockData';
import { Property } from '@/types';

/**
 * GET /api/properties
 * Fetch properties with optional filters
 * 
 * Query Parameters:
 * - search: string (search by title or locality)
 * - city: string (filter by city)
 * - type: string (filter by property type)
 * - minPrice: number
 * - maxPrice: number
 * - minArea: number
 * - maxArea: number
 * - page: number (default: 1)
 * - limit: number (default: 10)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const city = searchParams.get('city') || '';
    const type = searchParams.get('type') || '';
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || 'Infinity');
    const minArea = parseFloat(searchParams.get('minArea') || '0');
    const maxArea = parseFloat(searchParams.get('maxArea') || 'Infinity');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Filter properties
    let filtered = MOCK_PROPERTIES.filter((property) => {
      const matchesSearch =
        !search ||
        property.title.toLowerCase().includes(search.toLowerCase()) ||
        property.locality.toLowerCase().includes(search.toLowerCase());

      const matchesCity = !city || property.city === city;
      const matchesType = !type || property.type === type;
      const matchesPrice = property.price >= minPrice && property.price <= maxPrice;
      const matchesArea = property.area >= minArea && property.area <= maxArea;

      return (
        matchesSearch &&
        matchesCity &&
        matchesType &&
        matchesPrice &&
        matchesArea
      );
    });

    // Pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedProperties = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json(
      {
        success: true,
        data: paginatedProperties,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch properties',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/properties
 * Create a new property (requires authentication)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { title, type, city, locality, price, area, description } = body;

    if (!title || !type || !city || !locality || !price || !area) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // Create new property
    const newProperty: Property = {
      id: `prop_${Date.now()}`,
      title,
      type,
      city,
      locality,
      address: `${locality}, ${city}`,
      price: parseFloat(price),
      area: parseFloat(area),
      description: description || '',
      amenities: [],
      images: [{
        id: '1',
        url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
        alt: 'Property Image',
        isPrimary: true
      }],
      isFeatured: false,
      status: 'available',
      ownerId: 'owner_1',
      ownerName: 'Owner Name',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: newProperty,
        message: 'Property created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create property',
      },
      { status: 500 }
    );
  }
}
