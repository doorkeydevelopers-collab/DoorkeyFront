/**
 * Utility functions for the DoorKey property listing platform
 */

/**
 * Format price to Indian currency format
 * @param price - Price in rupees
 * @returns Formatted price string with currency symbol
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Format area in square feet with abbreviation
 * @param area - Area in square feet
 * @returns Formatted area string
 */
export const formatArea = (area: number): string => {
  if (area >= 1000000) {
    return `${(area / 1000000).toFixed(1)}M`;
  }
  if (area >= 1000) {
    return `${(area / 1000).toFixed(1)}K`;
  }
  return `${area}`;
};

/**
 * Get time ago string from a date
 * @param date - Date to format
 * @returns Time ago string (e.g., "2 days ago")
 */
export const getTimeAgo = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }

  return 'Just now';
};

/**
 * Truncate text to a maximum length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Validate email format
 * @param email - Email to validate
 * @returns true if valid email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format (Indian format)
 * @param phone - Phone number to validate
 * @returns true if valid phone format
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

/**
 * Generate random ID
 * @returns Random ID string
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

/**
 * Capitalize first letter of string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Get initials from name
 * @param name - Full name
 * @returns Initials (e.g., "JD" for "John Doe")
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Format date in readable format
 * @param date - Date to format
 * @returns Formatted date string (e.g., "15 Mar 2024")
 */
export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
};

/**
 * Check if string contains profanity (basic check)
 * @param text - Text to check
 * @returns true if potentially contains profanity
 */
export const containsProfanity = (text: string): boolean => {
  const badWords = ['badword1', 'badword2']; // Add actual words as needed
  const lowerText = text.toLowerCase();
  return badWords.some((word) => lowerText.includes(word));
};

/**
 * Debounce function execution
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};
