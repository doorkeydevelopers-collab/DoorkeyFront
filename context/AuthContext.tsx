'use client';

import React, { createContext, useState, useCallback, useEffect } from 'react';
import { User, SignupRequest, AuthContextType } from '@/types';
import {
  getAxiosInstance,
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

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
      // Note: axios interceptor already unwraps response.data
      const responseData = await axios.post(`${API_BASE_URL}/auth/start`, { email }) as any;
      
      const sessionId = responseData.Session || responseData.data?.Session;
      
      if (!sessionId) {
        throw new Error('Failed to initiate OTP flow');
      }

      const session: OTPAuthSession = {
        email,
        session: sessionId,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      };

      setOtpSession(session);
      toast.success(`OTP sent to ${email}`);
      return session;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to send OTP';
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
      // Note: axios interceptor already unwraps response.data,
      // so `response` here IS the data payload directly
      const data = await axios.post(`${API_BASE_URL}/auth/verify`, {
        email: otpSession.email,
        otp,
        session: otpSession.session,
      });

      // data is already the response body due to interceptor
      const responseData = (data as any);
      const accessToken = responseData.accessToken || responseData.data?.accessToken;
      const idToken = responseData.idToken || responseData.data?.idToken;

      if (!accessToken) {
        throw new Error('No access token received');
      }

      // Store tokens - accessToken in localStorage, refreshToken handled by axios
      setAuthToken(accessToken);
      setTokenState(accessToken);

      // Fetch user profile from backend (uses interceptor to attach token)
      const axiosInstance = getAxiosInstance();
      const userResponse = await axiosInstance.get('/auth/profile') as any;
      const userData = userResponse.user || userResponse.data?.user || userResponse;

      // Clean up OTP session
      setOtpSession(null);

      setUser(userData);
      setUserState(userData);

      toast.success(AUTH_MESSAGES.LOGIN_SUCCESS);
      return userData;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'OTP verification failed';
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

        const axiosInstance = getAxiosInstance();
        await axiosInstance.put('/auth/profile', data);

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

  const submitOwnerApplication = useCallback(
    async (applicationData: any) => {
      setIsLoading(true);
      try {
        const axiosInstance = getAxiosInstance();
        const response = await axiosInstance.post('/auth/owner-application', applicationData);
        toast.success('Owner application submitted successfully');
        return response;
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Failed to submit application';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getOwnerApplications = useCallback(
    async () => {
      try {
        const axiosInstance = getAxiosInstance();
        const response = await axiosInstance.get('/auth/owner-applications');
        return response.data.applications;
      } catch (error: any) {
        toast.error('Failed to fetch applications');
        throw error;
      }
    },
    []
  );

  const approveOwnerApplication = useCallback(
    async (applicationId: string) => {
      try {
        const axiosInstance = getAxiosInstance();
        const response = await axiosInstance.patch(`/auth/owner-application/${applicationId}/approve`);
        toast.success('Application approved successfully');
        return response;
      } catch (error: any) {
        toast.error('Failed to approve application');
        throw error;
      }
    },
    []
  );

  const rejectOwnerApplication = useCallback(
    async (applicationId: string) => {
      try {
        const axiosInstance = getAxiosInstance();
        const response = await axiosInstance.patch(`/auth/owner-application/${applicationId}/reject`);
        toast.success('Application rejected');
        return response;
      } catch (error: any) {
        toast.error('Failed to reject application');
        throw error;
      }
    },
    []
  );

  const refreshToken = useCallback(async () => {
    try {
      const axiosInstance = getAxiosInstance();
      const response = await axiosInstance.post('/auth/refresh');
      
      if (!response.data?.accessToken) {
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
    submitOwnerApplication,
    getOwnerApplications,
    approveOwnerApplication,
    rejectOwnerApplication,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
