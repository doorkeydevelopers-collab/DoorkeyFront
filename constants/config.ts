// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Debounce Configuration
export const DEBOUNCE_CONFIG = {
  SEARCH: 500, // milliseconds
  AUTO_SAVE: 1000,
  INPUT_VALIDATION: 300,
} as const;

// Pagination
export const PAGINATION_CONFIG = {
  PAGE_SIZE: 12,
  MAX_SIZE: 100,
} as const;

// Property Configuration
export const PROPERTY_CONFIG = {
  PROPERTY_TYPES: [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'mixed', label: 'Mixed Use' },
  ] as const,
  
  PROPERTY_STATUS: [
    { value: 'available', label: 'Available' },
    { value: 'rented', label: 'Rented' },
    { value: 'sold', label: 'Sold' },
    { value: 'pending', label: 'Pending' },
  ] as const,

  AMENITIES: [
    'Water Supply',
    'Electricity',
    'Parking',
    'Security',
    'Gym',
    'Swimming Pool',
    'Garden',
    'Balcony',
    'Lift',
    'Intercom',
  ] as const,

  MIN_PRICE: 0,
  MAX_PRICE: 100000000,
  MIN_AREA: 0,
  MAX_AREA: 1000000,
} as const;

// Filter Configuration
export const FILTER_CONFIG = {
  PRICE_STEPS: 10000,
  AREA_STEPS: 100,
} as const;

// Auth Configuration
export const AUTH_CONFIG = {
  TOKEN_KEY: 'doorkey_auth_token',
  REFRESH_TOKEN_KEY: 'doorkey_refresh_token',
  USER_KEY: 'doorkey_user',
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// User Roles
export const USER_ROLES = {
  OWNER: 'owner',
  TENANT: 'tenant',
  ADMIN: 'admin',
} as const;

// Image Configuration
export const IMAGE_CONFIG = {
  PLACEHOLDER: 'https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=500&h=500&fit=crop',
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

// Theme Colors (Sky Blue Theme)
export const THEME_CONFIG = {
  PRIMARY: '#0EA5E9', // sky-500
  PRIMARY_DARK: '#0284C7', // sky-600
  PRIMARY_LIGHT: '#38BDF8', // sky-400
  SECONDARY: '#64748B', // slate-500
  SUCCESS: '#10B981',
  ERROR: '#EF4444',
  WARNING: '#F59E0B',
} as const;

// Toast Configuration
export const TOAST_CONFIG = {
  DURATION: 3000, // 3 seconds
  MAX_TOASTS: 3,
  POSITION: 'top-right' as const,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  FILTERS: 'doorkey_filters',
  RECENT_SEARCHES: 'doorkey_recent_searches',
  USER_PREFERENCES: 'doorkey_preferences',
  BOOKMARKS: 'doorkey_bookmarks',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[0-9]{10}$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRES_UPPERCASE: true,
  PASSWORD_REQUIRES_NUMBER: true,
  PASSWORD_REQUIRES_SPECIAL: false,
  URL_REGEX: /^https?:\/\/.+/,
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_ADMIN_DASHBOARD: true,
  ENABLE_FEATURED_LISTINGS: true,
  ENABLE_BUILDER_PROJECTS: false, // Will be enabled later
  ENABLE_MESSAGING: false, // Will be enabled later
} as const;
