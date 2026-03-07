'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/custom/Header';
import { ProtectedRoute } from '@/components/custom/ProtectedRoute';
import { ConfirmDialog } from '@/components/custom/ConfirmDialog';
import { MOCK_PROPERTIES } from '@/services/mockData';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { PROPERTY_MESSAGES } from '@/constants/messages';

export default function AdminDashboardPage() {
  const [properties, setProperties] = useState(MOCK_PROPERTIES);
  const [featuredConfirm, setFeaturedConfirm] = useState<{
    isOpen: boolean;
    propertyId?: string;
    action?: 'feature' | 'unfeature';
  }>({ isOpen: false });
  const [isProcessing, setIsProcessing] = useState(false);

  const allProperties = properties;
  const featuredProperties = properties.filter((p) => p.isFeatured);
  const availableProperties = properties.filter((p) => p.status === 'available');

  const stats = [
    {
      icon: Building2,
      label: 'Total Properties',
      value: allProperties.length,
      color: 'text-blue-600',
    },
    {
      icon: Users,
      label: 'Active Users',
      value: '1,234',
      color: 'text-green-600',
    },
    {
      icon: Star,
      label: 'Featured Listings',
      value: featuredProperties.length,
      color: 'text-yellow-600',
    },
    {
      icon: TrendingUp,
      label: 'Avg. Conversion',
      value: '12.5%',
      color: 'text-purple-600',
    },
  ];

  const handleFeatureToggle = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    setFeaturedConfirm({
      isOpen: true,
      propertyId,
      action: property?.isFeatured ? 'unfeature' : 'feature',
    });
  };

  const handleFeatureConfirm = async () => {
    if (!featuredConfirm.propertyId) return;

    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setProperties((prev) =>
        prev.map((p) =>
          p.id === featuredConfirm.propertyId
            ? { ...p, isFeatured: !p.isFeatured }
            : p
        )
      );

      const action = featuredConfirm.action;
      toast.success(
        action === 'feature'
          ? PROPERTY_MESSAGES.PROPERTY_FEATURED
          : PROPERTY_MESSAGES.PROPERTY_UNFEATURED
      );
      setFeaturedConfirm({ isOpen: false });
    } catch (error) {
      toast.error('Failed to update property');
    } finally {
      setIsProcessing(false);
    }
  };

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
            {stats.map((stat) => {
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="featured">Featured Properties</TabsTrigger>
              <TabsTrigger value="all">All Properties</TabsTrigger>
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
                                        handleFeatureToggle(property.id)
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
                                      handleFeatureToggle(property.id)
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
