# DoorKey Development Guide

Complete guide for developing and contributing to the DoorKey platform.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Code Standards](#code-standards)
5. [Testing](#testing)
6. [Database](#database)
7. [API Development](#api-development)
8. [Component Development](#component-development)
9. [Debugging](#debugging)
10. [Common Tasks](#common-tasks)

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 8+
- Git
- Code editor (VS Code recommended)

### Setup

```bash
# Clone repository
git clone <repository-url>
cd doorkey

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env.local

# Start development server
pnpm dev

# Open browser
open http://localhost:3000
```

### VS Code Extensions (Recommended)

- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- TypeScript Vue Plugin
- Tailwind CSS IntelliSense
- Database Client (for PostgreSQL)

---

## Project Structure

```
doorkey/
├── app/                          # Next.js app router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page
│   ├── api/                     # API routes
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── signup/route.ts
│   │   └── properties/
│   │       ├── route.ts         # GET /properties, POST
│   │       └── [id]/route.ts    # GET/PUT/DELETE single
│   ├── login/
│   ├── signup/
│   ├── properties/
│   ├── property/
│   │   ├── [id]/page.tsx
│   │   └── create/page.tsx
│   ├── owner-dashboard/
│   ├── tenant-dashboard/
│   ├── admin-dashboard/
│   ├── not-found.tsx
│   ├── error.tsx
│   └── globals.css
├── components/
│   ├── custom/                  # Custom components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyGrid.tsx
│   │   ├── PropertyFilters.tsx
│   │   ├── PropertyCardSkeleton.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── UpdatePropertyModal.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── Breadcrumbs.tsx
│   └── ui/                      # shadcn/ui components
├── context/
│   └── AuthContext.tsx          # Auth state management
├── hooks/
│   ├── useAuth.ts               # Auth hook
│   ├── useApi.ts                # API calling hook
│   └── useDebounce.ts           # Debounce hook
├── services/
│   ├── axiosConfig.ts           # Axios setup
│   └── mockData.ts              # Mock data
├── constants/
│   ├── messages.ts              # UI messages
│   ├── config.ts                # Configuration
│   └── index.ts
├── schemas/
│   └── index.ts                 # Zod validation schemas
├── types/
│   └── index.ts                 # TypeScript definitions
├── lib/
│   ├── helpers.ts               # Utility functions
│   └── utils.ts                 # Tailwind utilities
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── DEVELOPMENT.md
├── public/
│   └── images/
├── .env.example
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
└── README.md
```

---

## Development Workflow

### Creating Features

#### 1. Create Feature Branch

```bash
# Update main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/property-search
```

#### 2. Develop Feature

```bash
# Start dev server
pnpm dev

# Make changes, test, commit frequently
git add .
git commit -m "feat: add property search functionality"
```

#### 3. Commit Guidelines

Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting changes
- `refactor:` - Code restructuring
- `test:` - Test additions
- `chore:` - Build/dependency updates

Example:
```bash
git commit -m "feat: add search filters for price and area"
git commit -m "fix: resolve property card loading state bug"
git commit -m "docs: update API documentation"
```

#### 4. Push and Create PR

```bash
git push origin feature/property-search

# Create pull request on GitHub
# Link issues, describe changes
```

#### 5. Code Review & Merge

- Address review comments
- Ensure tests pass
- Merge to main branch

---

## Code Standards

### TypeScript

**Always use strict mode:**

```typescript
// ✅ Good
const getUser = (id: string): User | null => {
  // ...
};

// ❌ Bad
const getUser = (id) => {
  // ...
};
```

### Naming Conventions

```typescript
// Components: PascalCase
components/custom/PropertyCard.tsx
export const PropertyCard = () => {};

// Hooks: camelCase with 'use' prefix
hooks/useAuth.ts
export const useAuth = () => {};

// Types: PascalCase
type User = { id: string; name: string };

// Constants: UPPER_SNAKE_CASE
const MAX_PROPERTIES = 100;

// Functions: camelCase
const formatPrice = (price: number) => {};

// Variables: camelCase
const propertyCount = 10;
```

### File Organization

```typescript
// ✅ Good structure
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Property } from '@/types';
import styles from './PropertyCard.module.css';

// Type definitions
interface PropertyCardProps {
  property: Property;
  onSelect: (id: string) => void;
}

// Component
export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelect,
}) => {
  // Hooks
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Functions
  const handleClick = () => {
    onSelect(property.id);
  };

  // Render
  return <button onClick={handleClick}>{property.title}</button>;
};
```

### React Best Practices

```typescript
// ✅ Use React.FC with proper typing
interface Props {
  title: string;
  onClick: () => void;
}

export const Button: React.FC<Props> = ({ title, onClick }) => (
  <button onClick={onClick}>{title}</button>
);

// ❌ Avoid
export const Button = ({ title, onClick }) => (
  <button onClick={onClick}>{title}</button>
);

// ✅ Use hooks properly
const MyComponent = () => {
  const [state, setState] = useState(false);

  useEffect(() => {
    // Setup logic
    return () => {
      // Cleanup
    };
  }, []);

  return <div>{state ? 'Active' : 'Inactive'}</div>;
};

// ✅ Proper error handling
try {
  const data = await fetchData();
  setData(data);
} catch (error) {
  console.error('Error:', error);
  showErrorToast('Failed to load data');
}
```

### CSS/Tailwind

```html
<!-- ✅ Use semantic classes -->
<div class="flex items-center justify-between gap-4 p-4">
  <h1 class="text-2xl font-bold text-foreground">Title</h1>
  <button class="bg-primary hover:bg-primary/90 text-white rounded-md">
    Click
  </button>
</div>

<!-- ✅ Mobile-first responsive -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Content -->
</div>

<!-- ❌ Avoid arbitrary values when possible -->
<div class="p-[42px]">Content</div> <!-- Use p-10 instead -->
```

---

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Writing Tests

```typescript
// Example component test
import { render, screen, fireEvent } from '@testing-library/react';
import { PropertyCard } from '@/components/custom/PropertyCard';

describe('PropertyCard', () => {
  it('renders property details', () => {
    const property = {
      id: '1',
      title: 'Test Property',
      price: 1000000,
      area: 1000,
      // ... other properties
    };

    render(
      <PropertyCard 
        property={property} 
        onBookmarkClick={jest.fn()}
      />
    );

    expect(screen.getByText('Test Property')).toBeInTheDocument();
    expect(screen.getByText('₹1,000,000')).toBeInTheDocument();
  });

  it('calls onClick when bookmarked', () => {
    const onBookmark = jest.fn();
    const property = { /* ... */ };

    render(
      <PropertyCard 
        property={property} 
        onBookmarkClick={onBookmark}
      />
    );

    const bookmarkButton = screen.getByRole('button');
    fireEvent.click(bookmarkButton);

    expect(onBookmark).toHaveBeenCalled();
  });
});
```

---

## Database

### Migrations

When adding schema changes:

```bash
# Create migration file
touch migrations/001_create_users_table.sql

# Content:
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  fullName VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
```

### Running Migrations

```bash
# Apply pending migrations
pnpm run migrate

# Rollback migration
pnpm run migrate:rollback
```

---

## API Development

### Creating API Routes

```typescript
// app/api/properties/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');

    // Validate
    if (!city) {
      return NextResponse.json(
        { error: 'City parameter required' },
        { status: 400 }
      );
    }

    // Fetch data
    const properties = await db.properties.findMany({
      where: { city },
    });

    return NextResponse.json({
      success: true,
      data: properties,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate
    const validation = propertySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Create
    const property = await db.properties.create({
      data: validation.data,
    });

    return NextResponse.json(
      { success: true, data: property },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
```

---

## Component Development

### Creating New Component

```typescript
// components/custom/NewComponent.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface NewComponentProps {
  title: string;
  onAction?: () => void;
}

/**
 * NewComponent - Brief description
 * 
 * Features:
 * - Feature 1
 * - Feature 2
 */
export const NewComponent: React.FC<NewComponentProps> = ({
  title,
  onAction,
}) => {
  return (
    <div className="p-4 rounded-lg border">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      {onAction && (
        <Button onClick={onAction}>Action</Button>
      )}
    </div>
  );
};
```

### Using Components

```typescript
import { NewComponent } from '@/components/custom/NewComponent';

export default function Page() {
  return (
    <NewComponent 
      title="My Component"
      onAction={() => console.log('clicked')}
    />
  );
}
```

---

## Debugging

### Console Logging

```typescript
// ✅ Use descriptive logs
console.log('[PropertyCard] Rendering property:', propertyId);
console.error('[API] Failed to fetch properties:', error);
console.warn('[Auth] Token expired, refreshing...');

// ❌ Avoid
console.log('test');
console.log(data);
```

### React DevTools

- Install React DevTools browser extension
- Inspect component props and state
- Profile performance

### Network Tab

- Check API requests/responses
- Monitor network performance
- Debug CORS issues

### VS Code Debugging

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "runtimeArgs": ["dev"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

---

## Common Tasks

### Adding a New Page

```bash
# Create page
mkdir app/new-page
touch app/new-page/page.tsx

# Content:
```typescript
'use client';

import { Header } from '@/components/custom/Header';
import { Footer } from '@/components/custom/Footer';

export default function NewPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Page content */}
      </main>
      <Footer />
    </div>
  );
}
```
```

### Adding a New Hook

```typescript
// hooks/useCustom.ts
import { useState, useCallback } from 'react';

/**
 * useCustom - Description of what hook does
 * @returns Object with hook data and methods
 */
export const useCustom = () => {
  const [state, setState] = useState(false);

  const toggle = useCallback(() => {
    setState(prev => !prev);
  }, []);

  return { state, toggle };
};

// Usage
const { state, toggle } = useCustom();
```

### Adding Validation Schema

```typescript
// schemas/index.ts
import { z } from 'zod';

export const propertySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  price: z.number().positive('Price must be positive'),
  city: z.string().min(1, 'City is required'),
  locality: z.string().min(1, 'Locality is required'),
});

// Usage
const validation = propertySchema.safeParse(data);
if (!validation.success) {
  console.error(validation.error);
}
```

### Adding Constants/Messages

```typescript
// constants/messages.ts
export const MESSAGES = {
  PROPERTY: {
    CREATE_SUCCESS: 'Property created successfully',
    CREATE_ERROR: 'Failed to create property',
    DELETE_SUCCESS: 'Property deleted successfully',
    UPDATE_SUCCESS: 'Property updated successfully',
  },
};

// Usage
import { MESSAGES } from '@/constants/messages';
toast.success(MESSAGES.PROPERTY.CREATE_SUCCESS);
```

---

## Performance Tips

1. **Use React.memo for expensive components**
   ```typescript
   export const PropertyCard = React.memo(({ property }) => {
     return <div>{property.title}</div>;
   });
   ```

2. **Optimize images**
   ```typescript
   import Image from 'next/image';
   
   <Image
     src="/image.jpg"
     alt="Description"
     width={800}
     height={600}
     quality={75}
   />
   ```

3. **Lazy load components**
   ```typescript
   const HeavyComponent = dynamic(() => import('./Heavy'), {
     loading: () => <Skeleton />,
   });
   ```

4. **Debounce search input**
   ```typescript
   const debouncedSearch = useDebounce(searchQuery, 300);
   ```

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Zod Documentation](https://zod.dev)

---

For questions or issues, refer to the project's issue tracker or contact the development team.
