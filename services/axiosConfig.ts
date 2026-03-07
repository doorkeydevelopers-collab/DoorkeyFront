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

  // Response Interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response.data;
    },
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Unauthorized - clear token and redirect to login
        clearAuthToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }

      const message =
        error.response?.data?.message ||
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
