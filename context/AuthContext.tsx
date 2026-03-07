'use client';

import React, { createContext, useState, useCallback, useEffect } from 'react';
import { User, SignupRequest, AuthContextType } from '@/types';
import {
  setAuthToken,
  getAuthToken,
  clearAuthToken,
  setUser,
  getUser,
  clearUser,
} from '@/services/axiosConfig';
import { AUTH_MESSAGES } from '@/constants/messages';
import { toast } from 'sonner';

// Mock user data for development
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'owner@example.com': {
    password: 'password123',
    user: {
      id: '1',
      email: 'owner@example.com',
      fullName: 'John Doe',
      phoneNumber: '9876543210',
      role: 'owner',
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  'tenant@example.com': {
    password: 'password123',
    user: {
      id: '2',
      email: 'tenant@example.com',
      fullName: 'Jane Smith',
      phoneNumber: '9876543211',
      role: 'tenant',
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  'admin@example.com': {
    password: 'password123',
    user: {
      id: '3',
      email: 'admin@example.com',
      fullName: 'Admin User',
      phoneNumber: '9876543212',
      role: 'admin',
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setTokenState] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = getUser();
    const storedToken = getAuthToken();
    if (storedUser && storedToken) {
      setUserState(storedUser);
      setTokenState(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        // Mock authentication
        const mockUserData = MOCK_USERS[email];
        if (!mockUserData || mockUserData.password !== password) {
          throw new Error(AUTH_MESSAGES.INVALID_CREDENTIALS);
        }

        const mockToken = `mock_token_${Date.now()}_${Math.random()}`;
        const userData = mockUserData.user;

        setAuthToken(mockToken);
        setUser(userData);
        setTokenState(mockToken);
        setUserState(userData);

        toast.success(AUTH_MESSAGES.LOGIN_SUCCESS);
      } catch (error: any) {
        const errorMessage =
          error.message || AUTH_MESSAGES.LOGIN_ERROR;
        toast.error(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signup = useCallback(
    async (data: SignupRequest) => {
      setIsLoading(true);
      try {
        // Check if email already exists
        if (MOCK_USERS[data.email]) {
          throw new Error(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);
        }

        // Mock signup
        const newUser: User = {
          id: `user_${Date.now()}`,
          email: data.email,
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          role: data.role,
          verified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Store new user in mock data
        MOCK_USERS[data.email] = {
          password: data.password,
          user: newUser,
        };

        toast.success(AUTH_MESSAGES.SIGNUP_SUCCESS);
      } catch (error: any) {
        const errorMessage =
          error.message || AUTH_MESSAGES.SIGNUP_ERROR;
        toast.error(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      clearAuthToken();
      clearUser();
      setUserState(null);
      setTokenState(null);
      toast.success(AUTH_MESSAGES.LOGOUT_SUCCESS);
    } catch (error: any) {
      toast.error(AUTH_MESSAGES.LOGOUT_ERROR);
      throw new Error(AUTH_MESSAGES.LOGOUT_ERROR);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      setIsLoading(true);
      try {
        if (!user) throw new Error('User not found');

        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        setUserState(updatedUser);
        toast.success('Profile updated successfully');
      } catch (error: any) {
        toast.error('Failed to update profile');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const refreshToken = useCallback(async () => {
    try {
      // Mock token refresh
      const newToken = `mock_token_${Date.now()}_${Math.random()}`;
      setAuthToken(newToken);
      setTokenState(newToken);
    } catch (error) {
      logout();
      throw error;
    }
  }, [logout]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && !!token,
    token,
    login,
    signup,
    logout,
    updateProfile,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
