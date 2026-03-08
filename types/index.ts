// User Types
export type UserRole = 'owner' | 'tenant' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  profileImage?: string;
  bio?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
}

// Property Types
export type PropertyType = 'residential' | 'commercial' | 'industrial' | 'agriculture' | 'mixed';
export type PropertyStatus = 'available' | 'rented' | 'sold' | 'pending';

export interface PropertyImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  ownerId: string;
  ownerName: string;
  price: number;
  area: number; // in sqft or sqm
  address: string;
  city: string;
  locality: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities: string[];
  images: PropertyImage[];
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFormData {
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  price: number;
  area: number;
  address: string;
  city: string;
  locality: string;
  state?: string;
  zipCode?: string;
  bedrooms?: number;
  bathrooms?: number;
  amenities: string[];
  images: string[]; // Image URLs
}

export interface CreatePropertyRequest extends PropertyFormData {
  // Property creation payload
}

export interface UpdatePropertyRequest extends Partial<PropertyFormData> {
  // Property update payload
}

// Search & Filter Types
export interface PropertyFilter {
  searchQuery?: string;
  type?: PropertyType;
  status?: PropertyStatus;
  city?: string;
  locality?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  amenities?: string[];
  bedroomMin?: number;
  bedroomMax?: number;
  bathroomMin?: number;
  bathroomMax?: number;
  isFeatured?: boolean;
  sortBy?: 'recent' | 'price-low' | 'price-high' | 'area';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
}

// OTP Session Type
export interface OTPAuthSession {
  email: string;
  session: string;
  expiresAt: number;
}

// Authentication Context Types
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  otpSession?: OTPAuthSession | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshToken: () => Promise<void>;
  startOTPFlow?: (email: string) => Promise<OTPAuthSession>;
  verifyOTP?: (otp: string) => Promise<User>;
}

// Bookmark Types
export interface Bookmark {
  propertyId: string;
  userId: string;
  createdAt: string;
}

// Message/Chat Types (Future use)
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  propertyId?: string;
  content: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

// Admin Types
export interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  featuredProperties: number;
  totalRevenue?: number;
  activeListings: number;
  soldProperties: number;
}

// Utility Types
export interface FormFieldError {
  field: string;
  message: string;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

// Featured Property Type
export interface FeaturedProperty {
  id: string;
  propertyId: string;
  property: Property;
  featuredSince: string;
  featuredUntil: string;
  priority: number;
  isActive: boolean;
}

// Builder Project Type (Future use)
export interface BuilderProject {
  id: string;
  name: string;
  description: string;
  builder: string;
  city: string;
  locality: string;
  properties: Property[];
  totalUnits: number;
  soldUnits: number;
  launchDate: string;
  completionDate?: string;
  amenities: string[];
  images: PropertyImage[];
  price: {
    min: number;
    max: number;
  };
  createdAt: string;
  updatedAt: string;
}
