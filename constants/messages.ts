// Authentication Messages
export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: 'Logged in successfully',
  LOGIN_ERROR: 'Failed to login. Please check your credentials.',
  SIGNUP_SUCCESS: 'Account created successfully. Please log in.',
  SIGNUP_ERROR: 'Failed to create account. Please try again.',
  LOGOUT_SUCCESS: 'Logged out successfully',
  LOGOUT_ERROR: 'Failed to logout. Please try again.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  PASSWORD_RESET_SENT: 'Password reset link sent to your email',
  PASSWORD_RESET_SUCCESS: 'Password reset successful',
  PASSWORD_RESET_ERROR: 'Failed to reset password',
  UNAUTHORIZED: 'You are not authorized to perform this action',
} as const;

// Property Messages
export const PROPERTY_MESSAGES = {
  PROPERTY_CREATED: 'Property listed successfully',
  PROPERTY_CREATED_ERROR: 'Failed to create property listing',
  PROPERTY_UPDATED: 'Property updated successfully',
  PROPERTY_UPDATED_ERROR: 'Failed to update property',
  PROPERTY_DELETED: 'Property deleted successfully',
  PROPERTY_DELETED_ERROR: 'Failed to delete property',
  PROPERTY_NOT_FOUND: 'Property not found',
  LOADING_PROPERTIES: 'Loading properties...',
  NO_PROPERTIES: 'No properties found',
  PROPERTY_FEATURED: 'Property added to featured',
  PROPERTY_UNFEATURED: 'Property removed from featured',
} as const;

// Search Messages
export const SEARCH_MESSAGES = {
  NO_RESULTS: 'No properties match your search criteria',
  SEARCH_ERROR: 'Error while searching. Please try again.',
  INVALID_FILTER: 'Invalid search filter',
} as const;

// Form Messages
export const FORM_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_PRICE: 'Please enter a valid price',
  FORM_SUBMIT_ERROR: 'Failed to submit form. Please try again.',
} as const;

// Confirmation Messages
export const CONFIRMATION_MESSAGES = {
  DELETE_PROPERTY: 'Are you sure you want to delete this property? This action cannot be undone.',
  DELETE_ACCOUNT: 'Are you sure you want to delete your account? This action cannot be undone.',
  CONFIRM_ACTION: 'Are you sure?',
  YES: 'Yes, Delete',
  NO: 'Cancel',
} as const;

// API Messages
export const API_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  REQUEST_TIMEOUT: 'Request timeout. Please try again.',
  RATE_LIMIT: 'Too many requests. Please wait before trying again.',
  LOADING: 'Loading...',
} as const;

// Validation Messages
export const VALIDATION_MESSAGES = {
  MIN_LENGTH: (field: string, length: number) => `${field} must be at least ${length} characters`,
  MAX_LENGTH: (field: string, length: number) => `${field} must not exceed ${length} characters`,
  INVALID_URL: 'Please enter a valid URL',
  INVALID_ADDRESS: 'Please enter a valid address',
} as const;
