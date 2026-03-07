import { z } from 'zod';
import { VALIDATION_RULES, PROPERTY_CONFIG } from '@/constants/config';
import { FORM_MESSAGES } from '@/constants/messages';

// Auth Schemas
export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, FORM_MESSAGES.REQUIRED_FIELD)
    .email(FORM_MESSAGES.INVALID_EMAIL),
  password: z
    .string()
    .min(VALIDATION_RULES.PASSWORD_MIN_LENGTH, 
      FORM_MESSAGES.PASSWORD_TOO_SHORT),
});

export const SignupSchema = z
  .object({
    email: z
      .string()
      .min(1, FORM_MESSAGES.REQUIRED_FIELD)
      .email(FORM_MESSAGES.INVALID_EMAIL),
    fullName: z
      .string()
      .min(2, FORM_MESSAGES.REQUIRED_FIELD)
      .max(100),
    phoneNumber: z
      .string()
      .regex(VALIDATION_RULES.PHONE_REGEX, FORM_MESSAGES.INVALID_PHONE),
    password: z
      .string()
      .min(VALIDATION_RULES.PASSWORD_MIN_LENGTH,
        FORM_MESSAGES.PASSWORD_TOO_SHORT),
    confirmPassword: z.string(),
    role: z.enum(['owner', 'tenant', 'admin']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: FORM_MESSAGES.PASSWORDS_DONT_MATCH,
    path: ['confirmPassword'],
  });

export const UpdateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2)
    .max(100)
    .optional(),
  phoneNumber: z
    .string()
    .regex(VALIDATION_RULES.PHONE_REGEX, FORM_MESSAGES.INVALID_PHONE)
    .optional(),
  bio: z
    .string()
    .max(500)
    .optional(),
  profileImage: z
    .string()
    .url(FORM_MESSAGES.INVALID_URL)
    .optional(),
});

// Property Schemas
export const PropertyFormSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must not exceed 200 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description must not exceed 5000 characters'),
  type: z.enum(['residential', 'commercial', 'industrial', 'agriculture', 'mixed']),
  status: z.enum(['available', 'rented', 'sold', 'pending']),
  price: z
    .number()
    .min(PROPERTY_CONFIG.MIN_PRICE, 'Price must be positive')
    .max(PROPERTY_CONFIG.MAX_PRICE, 'Price exceeds maximum limit'),
  area: z
    .number()
    .min(PROPERTY_CONFIG.MIN_AREA, 'Area must be positive')
    .max(PROPERTY_CONFIG.MAX_AREA, 'Area exceeds maximum limit'),
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(200),
  city: z
    .string()
    .min(2, 'City is required')
    .max(100),
  locality: z
    .string()
    .min(2, 'Locality is required')
    .max(100),
  state: z
    .string()
    .max(100)
    .optional(),
  zipCode: z
    .string()
    .max(20)
    .optional(),
  bedrooms: z
    .number()
    .min(0)
    .optional(),
  bathrooms: z
    .number()
    .min(0)
    .optional(),
  amenities: z
    .array(z.string())
    .default([]),
  images: z
    .array(z.string().url(FORM_MESSAGES.INVALID_URL))
    .min(1, 'At least one image is required')
    .max(10, 'Maximum 10 images allowed'),
});

// Search & Filter Schema
export const PropertyFilterSchema = z.object({
  searchQuery: z.string().optional(),
  type: z.enum(['residential', 'commercial', 'industrial', 'agriculture', 'mixed']).optional(),
  status: z.enum(['available', 'rented', 'sold', 'pending']).optional(),
  city: z.string().optional(),
  locality: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  minArea: z.number().min(0).optional(),
  maxArea: z.number().min(0).optional(),
  amenities: z.array(z.string()).optional(),
  bedroomMin: z.number().min(0).optional(),
  bedroomMax: z.number().min(0).optional(),
  bathroomMin: z.number().min(0).optional(),
  bathroomMax: z.number().min(0).optional(),
  isFeatured: z.boolean().optional(),
  sortBy: z.enum(['recent', 'price-low', 'price-high', 'area']).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(12),
});

// Featured Property Schema
export const FeaturedPropertySchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  featuredUntil: z.string().datetime('Invalid date format'),
  priority: z.number().min(1).max(10).default(5),
});

export type LoginFormData = z.infer<typeof LoginSchema>;
export type SignupFormData = z.infer<typeof SignupSchema>;
export type PropertyFormData = z.infer<typeof PropertyFormSchema>;
export type UpdateProfileData = z.infer<typeof UpdateProfileSchema>;
export type PropertyFilterData = z.infer<typeof PropertyFilterSchema>;
export type FeaturedPropertyData = z.infer<typeof FeaturedPropertySchema>;
