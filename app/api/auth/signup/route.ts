import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/signup
 * Register a new user
 * Returns user data and auth token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, role, phone } = body;

    // Validate input
    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format',
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password must be at least 6 characters',
        },
        { status: 400 }
      );
    }

    // Create new user (in real app, check for duplicates and hash password)
    const newUser = {
      id: `user_${Date.now()}`,
      email,
      password, // In real app, this should be hashed
      fullName,
      role: role as 'owner' | 'tenant' | 'admin',
      phone: phone || '',
      createdAt: new Date().toISOString(),
      avatar: '',
      verified: false,
    };

    // Generate mock token
    const token = `token_${newUser.id}_${Date.now()}`;

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      {
        success: true,
        data: {
          user: userWithoutPassword,
          token,
        },
        message: 'Account created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error signing up:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create account',
      },
      { status: 500 }
    );
  }
}
