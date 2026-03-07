import { NextRequest, NextResponse } from 'next/server';
import { MOCK_PROPERTIES } from '@/services/mockData';

/**
 * GET /api/properties/[id]
 * Fetch a single property by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const property = MOCK_PROPERTIES.find((p) => p.id === id);

    if (!property) {
      return NextResponse.json(
        {
          success: false,
          error: 'Property not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: property,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch property',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/properties/[id]
 * Update a property (requires authentication)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const property = MOCK_PROPERTIES.find((p) => p.id === id);

    if (!property) {
      return NextResponse.json(
        {
          success: false,
          error: 'Property not found',
        },
        { status: 404 }
      );
    }

    // Update property (in real app, this would update database)
    const updatedProperty = {
      ...property,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: updatedProperty,
        message: 'Property updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update property',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/properties/[id]
 * Delete a property (requires authentication)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const property = MOCK_PROPERTIES.find((p) => p.id === id);

    if (!property) {
      return NextResponse.json(
        {
          success: false,
          error: 'Property not found',
        },
        { status: 404 }
      );
    }

    // Delete property (in real app, this would delete from database)
    return NextResponse.json(
      {
        success: true,
        message: 'Property deleted successfully',
        data: { id },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete property',
      },
      { status: 500 }
    );
  }
}
