import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { API_CONFIG, AUTH_CONFIG } from '@/constants/config';
import { API_MESSAGES } from '@/constants/messages';

let axiosInstance: AxiosInstance;

export const getAxiosInstance = (): AxiosInstance => {
  if (!axiosInstance) {
    axiosInstance = createAxiosInstance();
  }
  return axiosInstance;
};

const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    withCredentials: true, // Enable sending cookies with requests
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request Interceptor
  instance.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      console.error('[API] Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Track if we're already handling a 401 to prevent duplicate redirects
  let isRedirectingTo401 = false;

  // Response Interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response.data;
    },
    (error: AxiosError) => {
      if (error.response?.status === 401 && !isRedirectingTo401) {
        isRedirectingTo401 = true;

        // Clear all auth data
        clearAuthToken();
        clearUser();

        if (typeof window !== 'undefined') {
          // Only redirect if not already on login page
          if (!window.location.pathname.startsWith('/login')) {
            // Use dynamic import to avoid bundling toast in the interceptor module scope
            import('sonner').then(({ toast }) => {
              toast.error('Session expired. Please sign in again.');
            });

            // Small delay so the toast is visible before redirect
            setTimeout(() => {
              window.location.href = '/login';
              isRedirectingTo401 = false;
            }, 300);
          } else {
            isRedirectingTo401 = false;
          }
        }
      }

      const message =
        (error.response?.data as any)?.message ||
        error.message ||
        API_MESSAGES.SERVER_ERROR;

      return Promise.reject({
        status: error.response?.status,
        message,
        code: error.code,
      });
    }
  );

  return instance;
};

// Token Management
export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  }
  return null;
};

export const clearAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
  }
};

// User Management
export const setUser = (user: any): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(user));
  }
};

export const getUser = (): any => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem(AUTH_CONFIG.USER_KEY);
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export const clearUser = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
  }
};

export default getAxiosInstance();
