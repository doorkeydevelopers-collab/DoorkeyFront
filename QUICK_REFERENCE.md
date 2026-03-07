# DoorKey - Quick Reference Guide

Fast lookup guide for common tasks and patterns.

---

## 🚀 Getting Started (5 minutes)

```bash
# 1. Install dependencies
pnpm install

# 2. Start dev server
pnpm dev

# 3. Open browser
open http://localhost:3000

# 4. Login with demo account
Email: owner@example.com
Password: password123
```

---

## 📱 Demo Accounts

```
Owner
├─ Email: owner@example.com
└─ Password: password123

Tenant
├─ Email: tenant@example.com
└─ Password: password123

Admin
├─ Email: admin@example.com
└─ Password: password123
```

---

## 📁 Key File Locations

| Purpose | File |
|---------|------|
| Authentication | `/context/AuthContext.tsx` |
| API Calls | `/hooks/useApi.ts` |
| Validation | `/schemas/index.ts` |
| Messages | `/constants/messages.ts` |
| Config | `/constants/config.ts` |
| Mock Data | `/services/mockData.ts` |
| Axios Setup | `/services/axiosConfig.ts` |
| Colors/Theme | `/app/globals.css` |
| Types | `/types/index.ts` |
| Utilities | `/lib/helpers.ts` |

---

## 🎨 Color Variables

```css
--primary: 192 90% 50%;        /* Sky Blue #0EA5E9 */
--secondary: 216 14% 32%;      /* Dark Blue #0369A1 */
--background: 0 0% 100%;       /* White */
--foreground: 0 0% 3.6%;       /* Dark Gray */
--border: 220 13% 91%;         /* Light Gray */
--destructive: 0 84% 60%;      /* Red */
--success: 120 100% 50%;       /* Green */
```

Use in Tailwind:
```html
<button class="bg-primary text-white">Button</button>
<div class="border border-border">Content</div>
```

---

## 🔗 API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/login` | No | User login |
| POST | `/api/auth/signup` | No | User registration |
| GET | `/api/properties` | No | Fetch properties |
| POST | `/api/properties` | Yes | Create property |
| GET | `/api/properties/[id]` | No | Get property detail |
| PUT | `/api/properties/[id]` | Yes | Update property |
| DELETE | `/api/properties/[id]` | Yes | Delete property |

---

## 📝 Common Code Snippets

### Import Components
```typescript
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/custom/PropertyCard';
import { Header } from '@/components/custom/Header';
import { Footer } from '@/components/custom/Footer';
```

### Use Authentication
```typescript
const { user, isAuthenticated, logout } = useAuth();

if (!isAuthenticated) {
  return <div>Please login</div>;
}
```

### Call API
```typescript
const { data, loading, error, refetch } = useApi({
  url: '/api/properties',
  method: 'GET',
  dependencies: [filter]
});

if (loading) return <LoadingSpinner />;
if (error) return <div>Error: {error}</div>;
return <div>{JSON.stringify(data)}</div>;
```

### Show Toast
```typescript
import { toast } from 'sonner';

toast.success('Property created successfully');
toast.error('Failed to create property');
toast.loading('Creating property...');
```

### Form with Validation
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { propertySchema } from '@/schemas';

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(propertySchema)
});

const onSubmit = async (data) => {
  // Handle form submission
};

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <input {...register('title')} />
    {errors.title && <span>{errors.title.message}</span>}
  </form>
);
```

### Search Debounce
```typescript
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

useEffect(() => {
  // Execute search when debounced value changes
  console.log('Searching for:', debouncedSearch);
}, [debouncedSearch]);
```

### Protected Page
```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/custom/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div>Admin only content</div>
    </ProtectedRoute>
  );
}
```

---

## 🧩 Component Usage Examples

### PropertyCard
```typescript
<PropertyCard
  property={property}
  isBookmarked={bookmarked}
  onBookmarkClick={() => toggleBookmark(property.id)}
/>
```

### PropertyGrid
```typescript
<PropertyGrid
  properties={properties}
  columns={3}
  gap="md"
  bookmarkedIds={bookmarkedSet}
  onBookmark={(id) => handleBookmark(id)}
/>
```

### ConfirmDialog
```typescript
<ConfirmDialog
  isOpen={isOpen}
  title="Delete Property"
  description="Are you sure you want to delete this property?"
  onConfirm={handleDelete}
  onCancel={() => setIsOpen(false)}
  variant="destructive"
/>
```

### EmptyState
```typescript
<EmptyState
  title="No properties found"
  description="Try adjusting your filters"
  icon={<SearchIcon />}
  action={{
    label: 'Browse all',
    onClick: () => navigate('/properties')
  }}
/>
```

### LoadingSpinner
```typescript
<LoadingSpinner 
  size="lg" 
  message="Loading properties..."
/>
```

---

## 🔧 Common Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Check code style
pnpm format           # Format code with Prettier
pnpm type-check       # Check TypeScript types

# Testing
pnpm test             # Run tests
pnpm test:watch      # Run tests in watch mode
pnpm test:coverage   # Run tests with coverage

# Dependencies
pnpm add <package>    # Add dependency
pnpm remove <package> # Remove dependency
pnpm update          # Update dependencies
```

---

## 📚 Documentation Links

| Document | Purpose |
|----------|---------|
| README.md | Project overview and setup |
| API.md | Complete API documentation |
| DEPLOYMENT.md | Deployment instructions |
| DEVELOPMENT.md | Development guide |
| PROJECT_SUMMARY.md | Full project details |

---

## 🐛 Debugging Tips

### Enable Console Logging
```typescript
// Development only
if (process.env.NODE_ENV === 'development') {
  console.log('[Component] Debug info:', data);
}
```

### Check Auth State
```typescript
import { useAuth } from '@/hooks/useAuth';

const { user, isAuthenticated } = useAuth();
console.log('Current user:', user);
console.log('Authenticated:', isAuthenticated);
```

### Network Requests
1. Open DevTools → Network tab
2. Look for API requests
3. Check response status and data
4. Check headers for authorization token

### React DevTools
1. Install React DevTools browser extension
2. Inspect component props and state
3. Profile component renders
4. Check hook values

---

## 🚨 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Blank page | Check browser console for errors |
| API 404 | Verify endpoint path and method |
| Auth token missing | Check localStorage in DevTools |
| Styles not applying | Verify Tailwind class names |
| Component not rendering | Check conditional rendering |
| Slow performance | Use React DevTools Profiler |

---

## 📦 Project Structure at a Glance

```
src/
├── app/                    # Next.js pages and routes
├── components/
│   ├── custom/            # Custom components
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
├── context/               # React Context providers
├── services/              # External services (API, mocks)
├── schemas/               # Zod validation schemas
├── constants/             # App constants and config
├── types/                 # TypeScript definitions
├── lib/                   # Utility functions
└── docs/                  # Documentation
```

---

## 🎨 Responsive Grid Classes

```html
<!-- 1 column mobile, 2 columns tablet, 3 columns desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Cards -->
</div>

<!-- Full width on mobile, side-by-side on desktop -->
<div class="flex flex-col md:flex-row gap-4">
  <!-- Items -->
</div>
```

---

## ✅ Pre-Deployment Checklist

- [ ] Update `.env.production` with real values
- [ ] Run `pnpm build` successfully
- [ ] Run `pnpm lint` with no errors
- [ ] Test all main user flows
- [ ] Setup database
- [ ] Configure CORS
- [ ] Setup error logging
- [ ] Setup monitoring
- [ ] Test authentication flow
- [ ] Verify API endpoints

---

## 🔑 Important Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` (Windows) / `Cmd+K` (Mac) | Command palette |
| `F12` | DevTools |
| `Ctrl+Shift+C` | Element inspector |
| `Ctrl+Alt+I` | React DevTools |

---

## 📞 Quick Links

- [Project Repository](#)
- [Issue Tracker](#)
- [Documentation](#)
- [Live Demo](#)
- [Support Slack](#)

---

## 💡 Pro Tips

1. **Use TypeScript** - Catch errors early with types
2. **Validate Input** - Always validate user input
3. **Handle Errors** - Always include error handling
4. **Test Locally** - Test features locally before deployment
5. **Document Code** - Add comments for complex logic
6. **Keep it DRY** - Reuse components and hooks
7. **Performance** - Use React DevTools Profiler
8. **Security** - Never expose secrets in code

---

**Last Updated**: March 2024
**Version**: 1.0.0
**Status**: Production Ready ✅
