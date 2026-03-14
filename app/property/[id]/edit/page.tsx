'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PropertyFormSchema, PropertyFormData } from '@/schemas';
import { ProtectedRoute } from '@/components/custom/ProtectedRoute';
import { Header } from '@/components/custom/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { PROPERTY_CONFIG } from '@/constants/config';
import { CITIES, LOCALITIES } from '@/services/mockData';
import { toast } from 'sonner';
import { PROPERTY_MESSAGES } from '@/constants/messages';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params?.id as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('');

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(PropertyFormSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'residential',
      status: 'available',
      price: 0,
      area: 0,
      address: '',
      city: '',
      locality: '',
      state: '',
      zipCode: '',
      bedrooms: undefined,
      bathrooms: undefined,
      amenities: [],
      images: [],
    },
  });

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const token = localStorage.getItem('doorkey_auth_token');
        if (!token) {
          throw new Error('Authentication required. Please log in.');
        }

        const response = await axios.get(`${API_BASE_URL}/properties/${propertyId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });

        const property = response.data.data || response.data;
        
        // Set the selected city for locality dropdown
        if (property.city) {
          setSelectedCity(property.city);
        }

        // Populate form with fetched data
        form.reset({
          title: property.title || '',
          description: property.description || '',
          type: property.type || 'residential',
          status: property.status || 'available',
          price: property.price || 0,
          area: property.area || 0,
          address: property.address || '',
          city: property.city || '',
          locality: property.locality || '',
          state: property.state || '',
          zipCode: property.zipCode || '',
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          amenities: property.amenities || [],
          images: property.images || [],
        });
      } catch (error: any) {
        const errorMessage = 
          error.response?.data?.error || 
          error.message || 
          'Failed to load property details';
        toast.error(errorMessage);
        console.error('Property fetch error:', error);
        // Redirect back if property not found
        router.push('/owner-dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId, form, router]);

  const onSubmit = async (data: PropertyFormData) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('doorkey_auth_token');
      
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      const response = await axios.put(`${API_BASE_URL}/properties/${propertyId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      toast.success(PROPERTY_MESSAGES.PROPERTY_UPDATED || 'Property updated successfully');
      router.push('/owner-dashboard');
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.error || 
        error.message || 
        PROPERTY_MESSAGES.PROPERTY_CREATED_ERROR;
      toast.error(errorMessage);
      console.error('Property update error:', error.response);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = form.getValues('amenities');
    const updated = currentAmenities.includes(amenity)
      ? currentAmenities.filter((a) => a !== amenity)
      : [...currentAmenities, amenity];
    form.setValue('amenities', updated);
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="owner">
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spinner size={32} />
            <p className="text-muted-foreground">Loading property details...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="owner">
      <div className="min-h-screen bg-background">
        <Header />

        <div className="container mx-auto px-4 max-w-4xl py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Edit Property</h1>
            <p className="text-muted-foreground">
              Update your property details on DoorKey
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
            >
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Modern 2 BHK Apartment"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your property in detail..."
                            disabled={isSubmitting}
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Type and Status Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Type */}
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PROPERTY_CONFIG.PROPERTY_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Status */}
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PROPERTY_CONFIG.PROPERTY_STATUS.map((status) => (
                                <SelectItem
                                  key={status.value}
                                  value={status.value}
                                >
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Pricing & Area */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Area</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Price */}
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              disabled={isSubmitting}
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? Number(e.target.value) : 0
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Area */}
                    <FormField
                      control={form.control}
                      name="area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Area (sqft)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              disabled={isSubmitting}
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? Number(e.target.value) : 0
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Bedrooms & Bathrooms */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrooms (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              disabled={isSubmitting}
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? Number(e.target.value) : undefined
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bathrooms (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              disabled={isSubmitting}
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? Number(e.target.value) : undefined
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Address */}
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter complete address"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* City */}
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              setSelectedCity(value);
                              form.setValue('locality', '');
                            }}
                            value={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select city" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CITIES.map((city) => (
                                <SelectItem key={city} value={city}>
                                  {city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Locality */}
                    <FormField
                      control={form.control}
                      name="locality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Locality</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isSubmitting || !selectedCity}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select locality" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {selectedCity &&
                                LOCALITIES[selectedCity]?.map((locality) => (
                                  <SelectItem key={locality} value={locality}>
                                    {locality}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* State */}
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="State"
                              disabled={isSubmitting}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Zip Code */}
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip Code (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Zip Code"
                              disabled={isSubmitting}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PROPERTY_CONFIG.AMENITIES.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity}
                          checked={form
                            .getValues('amenities')
                            .includes(amenity)}
                          onCheckedChange={() =>
                            handleAmenityToggle(amenity)
                          }
                          disabled={isSubmitting}
                        />
                        <Label
                          htmlFor={amenity}
                          className="font-normal cursor-pointer"
                        >
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Property Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URLs</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter image URLs (one per line)"
                            disabled={isSubmitting}
                            rows={4}
                            value={field.value.join('\n')}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  .split('\n')
                                  .filter((url) => url.trim())
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground mt-2">
                          Add at least one image URL. You can get free image URLs from Unsplash or similar services.
                        </p>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 h-12"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner className="mr-2" size={16} />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="h-12"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
