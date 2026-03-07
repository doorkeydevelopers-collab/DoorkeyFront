# DoorKey - Premium Property Listing Platform

A modern, enterprise-grade property listing platform built with Next.js, React, and TypeScript. Connect property owners and tenants across residential, commercial, industrial, and agricultural properties.

## 🌟 Features

- **Property Listings**: Browse thousands of properties across multiple categories
- **Advanced Search**: Filter by city, locality, price, area, and property type
- **Featured Properties**: Premium property showcase section
- **User Roles**: Owner (seller), Tenant (buyer), and Admin dashboards
- **Property Management**: Create, edit, and delete property listings
- **Bookmarking**: Save favorite properties for later
- **Responsive Design**: Mobile-first, fully responsive UI
- **Beautiful UI**: Sky blue theme with Sonner toast notifications
- **Form Validation**: React Hook Form with Zod schema validation
- **State Management**: React Context for authentication

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (or npm/yarn)

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
doorkey/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Home page
│   ├── login/                  # Authentication pages
│   ├── signup/
│   ├── properties/             # Property search & listing
│   ├── property/
│   │   ├── [id]/              # Property detail page
│   │   └── create/            # Create property page
│   ├── owner-dashboard/        # Owner management dashboard
│   ├── tenant-dashboard/       # Tenant saved properties
│   └── admin-dashboard/        # Admin featured properties
├── components/
│   ├── custom/                 # Custom components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyFilters.tsx
│   │   └── ... more components
│   └── ui/                     # shadcn/ui components
├── context/
│   └── AuthContext.tsx         # Authentication context
├── hooks/
│   ├── useAuth.ts              # Auth context hook
│   ├── useApi.ts               # API calling hook
│   └── useDebounce.ts          # Debounce hook
├── services/
│   ├── axiosConfig.ts          # Axios setup with interceptors
│   └── mockData.ts             # Mock data for development
├── constants/
│   ├── messages.ts             # All UI messages
│   ├── config.ts               # App configuration
│   └── index.ts                # Exported constants
├── types/
│   └── index.ts                # TypeScript type definitions
├── lib/
│   ├── helpers.ts              # Utility functions
│   └── utils.ts                # Tailwind utils
├── schemas/
│   └── index.ts                # Zod validation schemas
└── styles/
    └── app/globals.css         # Global styles & theme
```

## 🎨 Color Scheme (Sky Blue Theme)

- **Primary**: `#0EA5E9` (Sky Blue)
- **Secondary**: `#0369A1` (Dark Blue)
- **Background**: `#FFFFFF` (White)
- **Text**: `#1F2937` (Dark Gray)
- **Border**: `#E5E7EB` (Light Gray)
- **Success**: `#10B981` (Green)
- **Error**: `#EF4444` (Red)

Customizable via CSS variables in `app/globals.css`

## 🔐 Demo Credentials

**Owner Account**
- Email: `owner@example.com`
- Password: `password123`

**Tenant Account**
- Email: `tenant@example.com`
- Password: `password123`

**Admin Account**
- Email: `admin@example.com`
- Password: `password123`

## 🔧 Technology Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19.2
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Validation**: Zod
- **HTTP Client**: Axios
- **Notifications**: Sonner
- **State Management**: React Context API

### Development
- **Language**: TypeScript
- **Package Manager**: pnpm
- **Code Quality**: ESLint, Prettier
- **Testing**: Jest (ready to add)

## 📝 Available Scripts

```bash
# Development
pnpm dev          # Start dev server
pnpm dev --open   # Open in browser

# Production
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run ESLint
pnpm type-check   # Check TypeScript types
```

## 🎯 Key Features Implementation

### Authentication
- Mock auth system with localStorage persistence
- Role-based access control (Owner, Tenant, Admin)
- Protected routes with automatic redirects
- Axios interceptors for token management

### Property Management
- Create, read, update, delete properties
- Bulk actions for property management
- Property status tracking (Available, Rented, Pending)
- Featured property management (Admin only)

### Search & Filters
- Real-time search with debouncing (300ms)
- Advanced filtering by:
  - City/Locality
  - Property Type
  - Price Range
  - Area Range
- Pagination with configurable page size

### User Experience
- Beautiful Sonner toast notifications
- Confirmation dialogs for destructive actions
- Loading skeletons for async operations
- Error boundaries with graceful error handling
- Responsive mobile-first design
- Accessibility standards (ARIA labels, semantic HTML)

## 🔄 Form Validation

All forms use React Hook Form with Zod schema validation:
- Login/Signup forms
- Property creation/editing forms
- Contact forms
- Search filters

Schemas defined in `schemas/index.ts` with custom error messages from `constants/messages.ts`

## 🌐 API Integration

### useApi Hook
```typescript
const { data, loading, error, refetch } = useApi({
  url: '/api/properties',
  method: 'GET',
  dependencies: [filters]
});
```

### Axios Configuration
- Automatic token injection in headers
- Request/response interceptors
- Error handling and retry logic
- Timeout configuration

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
  - `2xl`: 1536px

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel deploy
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

## 📊 Mock Data

Development uses mock data defined in `services/mockData.ts`:
- 20+ sample properties across all categories
- Demo users (owner, tenant, admin)
- Realistic property data with images, amenities, pricing

Ready to replace with real API endpoints.

## 🔮 Future Enhancements

- [ ] Real database integration (Supabase/Neon)
- [ ] File upload for property images (Vercel Blob)
- [ ] Email notifications
- [ ] Payment integration (Stripe)
- [ ] Messaging system between owners and tenants
- [ ] Advanced analytics dashboard
- [ ] Rating and review system
- [ ] Virtual property tours
- [ ] AI-powered property recommendations
- [ ] Mobile app (React Native)

## 📚 Documentation

- **API Routes**: `docs/api.md`
- **Component Guide**: `docs/components.md`
- **Styling Guide**: `docs/styling.md`
- **Configuration**: `docs/config.md`

## 🤝 Contributing

Contributions are welcome! Please follow the code style and create pull requests for any improvements.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 💬 Support

For issues and feature requests, please open a GitHub issue or contact support@doorkey.com

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide React](https://lucide.dev)
- Styling with [Tailwind CSS](https://tailwindcss.com)

---

**DoorKey - Connecting Property Owners & Tenants Across India**
#   D o o r k e y F r o n t  
 