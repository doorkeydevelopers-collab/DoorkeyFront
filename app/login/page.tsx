'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { OTPStartSchema, OTPVerifySchema, OTPStartFormData, OTPVerifyFormData } from '@/schemas';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Spinner } from '@/components/ui/spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { KEY_ICON } from './icons';

export default function LoginPage() {
  const router = useRouter();
  const { startOTPFlow, verifyOTP } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [otpTimeLeft, setOtpTimeLeft] = useState(0);

  const emailForm = useForm<OTPStartFormData>({
    resolver: zodResolver(OTPStartSchema),
    defaultValues: {
      email: '',
    },
  });

  const otpForm = useForm<OTPVerifyFormData>({
    resolver: zodResolver(OTPVerifySchema),
    defaultValues: {
      otp: '',
    },
  });

  // Timer for resend OTP
  React.useEffect(() => {
    if (otpTimeLeft > 0) {
      const timer = setTimeout(() => setOtpTimeLeft(otpTimeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimeLeft]);

  const handleEmailSubmit = async (data: OTPStartFormData) => {
    setIsLoading(true);
    try {
      if (!startOTPFlow) {
        throw new Error('OTP flow not available');
      }

      await startOTPFlow(data.email);
      setUserEmail(data.email);
      setShowOTPDialog(true);
      setOtpTimeLeft(60); // 60 seconds timer
      otpForm.reset();
    } catch (error) {
      console.error('OTP start error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (data: OTPVerifyFormData) => {
    setIsLoading(true);
    try {
      if (!verifyOTP) {
        throw new Error('OTP verification not available');
      }

      await verifyOTP(data.otp);
      setShowOTPDialog(false);
      router.push('/');
    } catch (error) {
      console.error('OTP verification error:', error);
      otpForm.setError('otp', {
        type: 'manual',
        message: 'Invalid OTP. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!startOTPFlow) return;
    
    setIsLoading(true);
    try {
      await startOTPFlow(userEmail);
      setOtpTimeLeft(60);
      otpForm.reset();
    } catch (error) {
      console.error('Resend OTP error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo Section */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white text-xl font-bold">
              {KEY_ICON}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">DoorKey</h1>
          <p className="text-gray-600">Your Premium Property Listing Platform</p>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in with your email to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...emailForm}>
              <form
                onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
                className="space-y-4"
              >
                {/* Email Field */}
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Spinner className="mr-2" size={16} />
                      Sending OTP...
                    </>
                  ) : (
                    'Continue with Email'
                  )}
                </Button>

                {/* Info Message */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs space-y-1">
                  <p className="font-semibold text-gray-700">No Password Needed!</p>
                  <p className="text-gray-600">We'll send you a one-time password (OTP) to verify your email.</p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Sign Up Link */}
        <p className="text-center text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>

      {/* OTP Verification Dialog */}
      <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Your Email</DialogTitle>
            <DialogDescription>
              Enter the OTP sent to <span className="font-semibold">{userEmail}</span>
            </DialogDescription>
          </DialogHeader>

          <Form {...otpForm}>
            <form
              onSubmit={otpForm.handleSubmit(handleOTPSubmit)}
              className="space-y-4"
            >
              {/* OTP Field */}
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>One-Time Password</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="000000"
                        disabled={isLoading}
                        maxLength={6}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2" size={16} />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>

              {/* Resend Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isLoading || otpTimeLeft > 0}
                onClick={handleResendOTP}
              >
                {otpTimeLeft > 0 ? `Resend in ${otpTimeLeft}s` : 'Resend OTP'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
