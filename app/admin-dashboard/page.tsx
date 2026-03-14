'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Header } from '@/components/custom/Header';
import { ProtectedRoute } from '@/components/custom/ProtectedRoute';
import { ConfirmDialog } from '@/components/custom/ConfirmDialog';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Building2,
  Users,
  TrendingUp,
  Star,
  MoreVertical,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { PROPERTY_MESSAGES } from '@/constants/messages';
import { useAuth } from '@/hooks/useAuth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface AdminStats {
  totalProperties: number;
  activeProperties: number;
  featuredProperties: number;
  totalUsers: number;
  totalViews: number;
  totalLikes: number;
  averagePrice: number;
  properties: any[];
}

interface OwnerApplication {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  experience: string;
  propertiesCount: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: any;
}

// Owner Applications Tab Component
function OwnerApplicationsTab() {
  const { getOwnerApplications, approveOwnerApplication, rejectOwnerApplication } = useAuth();
  const [applications, setApplications] = useState<OwnerApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const apps = await getOwnerApplications();
      setApplications(apps);
    } catch (error) {
      toast.error('Failed to fetch applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    setProcessingId(applicationId);
    try {
      await approveOwnerApplication(applicationId);
      setApplications(apps => apps.filter(app => app.id !== applicationId));
    } catch (error) {
      // Error already handled in the hook
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    setProcessingId(applicationId);
    try {
      await rejectOwnerApplication(applicationId);
      setApplications(apps => apps.filter(app => app.id !== applicationId));
    } catch (error) {
      // Error already handled in the hook
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Owner Applications</CardTitle>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <div className="text-center py-8">
            <Check className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <p className="text-muted-foreground">
              No pending applications
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id} className="border-l-4 border-l-yellow-500">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{application.fullName}</h3>
                      <p className="text-sm text-muted-foreground">{application.userId}</p>
                      <p className="text-sm text-muted-foreground">{application.phoneNumber}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(application.id)}
                        disabled={processingId === application.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {processingId === application.id ? <Spinner size={14} /> : <Check size={16} />}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(application.id)}
                        disabled={processingId === application.id}
                      >
                        {processingId === application.id ? <Spinner size={14} /> : <X size={16} />}
                        Reject
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Experience:</span> {application.experience}
                    </div>
                    <div>
                      <span className="font-medium">Properties:</span> {application.propertiesCount}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <span className="font-medium text-sm">Reason:</span>
                    <p className="text-sm text-muted-foreground mt-1">{application.reason}</p>
                  </div>
                  
                  <div className="mt-4 text-xs text-muted-foreground">
                    Submitted: {new Date(application.submittedAt.seconds * 1000).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredConfirm, setFeaturedConfirm] = useState<{
    isOpen: boolean;
    propertyId?: string;
    action?: 'feature' | 'unfeature';
  }>({ isOpen: false });
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch admin stats
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('doorkey_auth_token');
        if (!token) {
          throw new Error('Authentication required');
        }

        const response = await axios.get(`${API_BASE_URL}/properties/dashboard/admin`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        setStats(response.data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || 'Failed to load dashboard';
        setError(errorMessage);
        console.error('Admin stats error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleFeatureToggle = (propertyId: string, isFeatured: boolean) => {
    setFeaturedConfirm({
      isOpen: true,
      propertyId,
      action: isFeatured ? 'unfeature' : 'feature',
    });
  };

  const handleFeatureConfirm = async () => {
    if (!featuredConfirm.propertyId || !stats) return;

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('doorkey_auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.patch(
        `${API_BASE_URL}/properties/${featuredConfirm.propertyId}/featured`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      // Update local state
      const updatedProperties = stats.properties.map(p =>
        p.id === featuredConfirm.propertyId
          ? { ...p, isFeatured: response.data.isFeatured }
          : p
      );

      const newFeaturedCount = updatedProperties.filter(p => p.isFeatured).length;

      setStats({
        ...stats,
        featuredProperties: newFeaturedCount,
        properties: updatedProperties,
      });

      const action = featuredConfirm.action;
      toast.success(
        action === 'feature'
          ? PROPERTY_MESSAGES.PROPERTY_FEATURED
          : PROPERTY_MESSAGES.PROPERTY_UNFEATURED
      );
      setFeaturedConfirm({ isOpen: false });
    } catch (err: any) {
      console.log(err);
      const errorMessage = err.response?.data?.error || 'Failed to update property';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="admin">
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 max-w-7xl py-8 flex items-center justify-center">
            <Spinner />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !stats) {
    return (
      <ProtectedRoute requiredRole="admin">
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 max-w-7xl py-8">
            <Card className="border-destructive">
              <CardContent className="pt-6 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                <p className="text-lg font-semibold mb-2">Error Loading Dashboard</p>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const dashboardStats = [
    {
      icon: Building2,
      label: 'Total Properties',
      value: stats.totalProperties,
      color: 'text-blue-600',
    },
    {
      icon: Users,
      label: 'Active Users',
      value: stats.totalUsers,
      color: 'text-green-600',
    },
    {
      icon: Star,
      label: 'Featured Listings',
      value: stats.featuredProperties,
      color: 'text-yellow-600',
    },
    {
      icon: TrendingUp,
      label: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      color: 'text-purple-600',
    },
  ];

  const allProperties = stats.properties;
  const featuredProperties = stats.properties.filter((p) => p.isFeatured);
  const availableProperties = stats.properties.filter((p) => p.status === 'available');

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-background">
        <Header />

        <div className="container mx-auto px-4 max-w-7xl py-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage platform, properties, and featured listings
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-bold text-primary">
                          {stat.value}
                        </p>
                      </div>
                      <Icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Management Sections */}
          <Tabs defaultValue="featured" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="featured">Featured Properties</TabsTrigger>
              <TabsTrigger value="all">All Properties</TabsTrigger>
              <TabsTrigger value="applications">Owner Applications</TabsTrigger>
              <TabsTrigger value="moderation">Moderation Queue</TabsTrigger>
            </TabsList>

            {/* Featured Properties */}
            <TabsContent value="featured" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Featured Properties Management</CardTitle>
                </CardHeader>
                <CardContent>
                  {featuredProperties.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No featured properties
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-semibold">
                              Property
                            </th>
                            <th className="text-left py-3 px-4 font-semibold">
                              Owner
                            </th>
                            <th className="text-left py-3 px-4 font-semibold">
                              City
                            </th>
                            <th className="text-left py-3 px-4 font-semibold">
                              Price
                            </th>
                            <th className="text-left py-3 px-4 font-semibold">
                              Priority
                            </th>
                            <th className="text-right py-3 px-4 font-semibold">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {featuredProperties.map((property) => (
                            <tr
                              key={property.id}
                              className="border-b hover:bg-muted/50"
                            >
                              <td className="py-4 px-4">
                                <p className="font-semibold text-sm">
                                  {property.title}
                                </p>
                              </td>
                              <td className="py-4 px-4 text-sm">
                                {property.ownerName}
                              </td>
                              <td className="py-4 px-4">
                                <Badge variant="outline">
                                  {property.city}
                                </Badge>
                              </td>
                              <td className="py-4 px-4 font-semibold">
                                ₹{(property.price / 1000000).toFixed(1)}Cr
                              </td>
                              <td className="py-4 px-4">
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  Priority
                                </Badge>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical size={18} />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                      <Link href={`/property/${property.id}`}>
                                        View Property
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleFeatureToggle(property.id, true)
                                      }
                                    >
                                      Remove from Featured
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* All Properties */}
            <TabsContent value="all" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold">
                            Property
                          </th>
                          <th className="text-left py-3 px-4 font-semibold">
                            Type
                          </th>
                          <th className="text-left py-3 px-4 font-semibold">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 font-semibold">
                            Featured
                          </th>
                          <th className="text-right py-3 px-4 font-semibold">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {allProperties.map((property) => (
                          <tr
                            key={property.id}
                            className="border-b hover:bg-muted/50"
                          >
                            <td className="py-4 px-4">
                              <p className="font-semibold text-sm">
                                {property.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {property.ownerName}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant="outline" className="capitalize">
                                {property.type}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <Badge
                                className={
                                  property.status === 'available'
                                    ? 'bg-green-100 text-green-800'
                                    : property.status === 'rented'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                }
                              >
                                {property.status}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              {property.isFeatured ? (
                                <Badge className="bg-yellow-100 text-yellow-800 gap-1">
                                  <Star size={14} />
                                  Featured
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  —
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical size={18} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/property/${property.id}`}>
                                      View Property
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleFeatureToggle(property.id, property.isFeatured || false)
                                    }
                                  >
                                    <Star size={16} className="mr-2" />
                                    {property.isFeatured
                                      ? 'Remove from Featured'
                                      : 'Add to Featured'}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Moderation Queue */}
            <TabsContent value="moderation" className="space-y-6 mt-6">
              <Card>
                <CardContent className="text-center py-12">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-semibold mb-2">
                    Moderation Queue Empty
                  </p>
                  <p className="text-muted-foreground">
                    All properties have been reviewed and approved
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Owner Applications */}
            <TabsContent value="applications" className="space-y-6 mt-6">
              <OwnerApplicationsTab />
            </TabsContent>
          </Tabs>

          {/* Feature Confirmation Dialog */}
          <ConfirmDialog
            isOpen={featuredConfirm.isOpen}
            title={
              featuredConfirm.action === 'feature'
                ? 'Add to Featured'
                : 'Remove from Featured'
            }
            description={
              featuredConfirm.action === 'feature'
                ? 'This property will be promoted to featured status.'
                : 'This property will be removed from featured status.'
            }
            confirmText={
              featuredConfirm.action === 'feature' ? 'Add to Featured' : 'Remove'
            }
            isLoading={isProcessing}
            onConfirm={handleFeatureConfirm}
            onCancel={() => setFeaturedConfirm({ isOpen: false })}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
