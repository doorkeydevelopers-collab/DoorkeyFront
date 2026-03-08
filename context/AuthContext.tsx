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
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface OTPAuthSession {
  email: string;
  session: string;
  expiresAt: number;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setTokenState] = useState<string | null>(null);
  const [otpSession, setOtpSession] = useState<OTPAuthSession | null>(null);

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

  const startOTPFlow = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/start`, { email });
      
      if (!response.data.Session) {
        throw new Error('Failed to initiate OTP flow');
      }

      const session: OTPAuthSession = {
        email,
        session: response.data.Session,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      };

      setOtpSession(session);
      toast.success(`OTP sent to ${email}`);
      return session;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to send OTP';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyOTP = useCallback(async (otp: string) => {
    if (!otpSession) {
      throw new Error('No OTP session found');
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify`, {
        email: otpSession.email,
        otp,
        session: otpSession.session,
      });

      const { accessToken, idToken } = response.data;

      if (!accessToken) {
        throw new Error('No access token received');
      }

      // Store tokens - accessToken in localStorage, refreshToken handled by axios
      setAuthToken(accessToken);
      setTokenState(accessToken);

      // Clean up OTP session
      setOtpSession(null);

      // For now, create a basic user object from email
      // In production, you might fetch user profile from an endpoint
      const userData: User = {
        id: otpSession.email, // Use email as ID
        email: otpSession.email,
        fullName: otpSession.email.split('@')[0],
        phoneNumber: '',
        role: 'owner', // Default role - could be enhanced with backend
        verified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUser(userData);
      setUserState(userData);

      toast.success(AUTH_MESSAGES.LOGIN_SUCCESS);
      return userData;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'OTP verification failed';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [otpSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      // For OTP flow, we start the OTP and let the component handle OTP input
      // This login method is kept for compatibility but uses OTP start
      return startOTPFlow(email);
    },
    [startOTPFlow]
  );

  const signup = useCallback(
    async (data: SignupRequest) => {
      setIsLoading(true);
      try {
        // Start OTP flow for signup
        // Note: Role information can be configured after verification
        await startOTPFlow(data.email);

        // The verification happens in a separate step
        toast.success('OTP sent to your email. Please verify to complete signup.');
      } catch (error: any) {
        const errorMessage =
          error.message || AUTH_MESSAGES.SIGNUP_ERROR;
        toast.error(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [startOTPFlow]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      clearAuthToken();
      clearUser();
      setUserState(null);
      setTokenState(null);
      setOtpSession(null);
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
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`);
      
      if (!response.data.accessToken) {
        throw new Error('Failed to refresh token');
      }

      setAuthToken(response.data.accessToken);
      setTokenState(response.data.accessToken);
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
    otpSession,
    startOTPFlow,
    verifyOTP,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
