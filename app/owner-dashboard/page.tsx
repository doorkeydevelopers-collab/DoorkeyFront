'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Header } from '@/components/custom/Header';
import { ProtectedRoute } from '@/components/custom/ProtectedRoute';
import { PropertyCard } from '@/components/custom/PropertyCard';
import { ConfirmDialog } from '@/components/custom/ConfirmDialog';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Eye,
  Heart,
  MoreVertical,
  Plus,
  TrendingUp,
  Edit,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { PROPERTY_MESSAGES, CONFIRMATION_MESSAGES } from '@/constants/messages';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface OwnerStats {
  totalProperties: number;
  activeProperties: number;
  totalViews: number;
  totalLikes: number;
  averagePrice: number;
  properties: any[];
}

export default function OwnerDashboardPage() {
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    propertyId?: string;
  }>({ isOpen: false });
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch owner stats and properties
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('doorkey_auth_token');
        if (!token) {
          throw new Error('Authentication required');
        }

        const response = await axios.get(`${API_BASE_URL}/properties/dashboard/owner`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        setStats(response.data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || 'Failed to load dashboard';
        setError(errorMessage);
        console.error('Owner stats error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleDeleteConfirm = (propertyId: string) => {
    setDeleteConfirm({ isOpen: true, propertyId });
  };

  const handleDeleteProperty = async () => {
    if (!deleteConfirm.propertyId || !stats) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('doorkey_auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      await axios.delete(`${API_BASE_URL}/properties/${deleteConfirm.propertyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      // Update local state
      setStats({
        ...stats,
        totalProperties: stats.totalProperties - 1,
        activeProperties: stats.properties.find(p => p.id === deleteConfirm.propertyId)?.status === 'available' 
          ? stats.activeProperties - 1 
          : stats.activeProperties,
        properties: stats.properties.filter(p => p.id !== deleteConfirm.propertyId),
      });

      toast.success(PROPERTY_MESSAGES.PROPERTY_DELETED);
      setDeleteConfirm({ isOpen: false });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to delete property';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="owner">
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
      <ProtectedRoute requiredRole="owner">
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
    },
    {
      icon: Eye,
      label: 'Total Views',
      value: stats.totalViews.toLocaleString(),
    },
    {
      icon: Heart,
      label: 'Total Likes',
      value: stats.totalLikes.toLocaleString(),
    },
    {
      icon: TrendingUp,
      label: 'Average Price',
      value: `₹${(stats.averagePrice / 1000000).toFixed(2)}Cr`,
    },
  ];

  const availableProperties = stats.properties.filter(
    (p) => p.status === 'available'
  );
  const rentedProperties = stats.properties.filter(
    (p) => p.status === 'rented'
  );
  const pendingProperties = stats.properties.filter(
    (p) => p.status === 'pending'
  );

  return (
    <ProtectedRoute requiredRole="owner">
      <div className="min-h-screen bg-background">
        <Header />

        <div className="container mx-auto px-4 max-w-7xl py-8">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Owner Dashboard</h1>
              <p className="text-muted-foreground">
                Manage and monitor your property listings
              </p>
            </div>
            <Link href="/property/create">
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <Plus size={20} />
                List New Property
              </Button>
            </Link>
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
                      <Icon className="h-8 w-8 text-primary/30" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Properties Section */}
          <Card>
            <CardHeader>
              <CardTitle>Your Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">
                    All ({stats.properties.length})
                  </TabsTrigger>
                  <TabsTrigger value="available">
                    Available ({availableProperties.length})
                  </TabsTrigger>
                  <TabsTrigger value="rented">
                    Rented ({rentedProperties.length})
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    Pending ({pendingProperties.length})
                  </TabsTrigger>
                </TabsList>

                {/* All Properties */}
                <TabsContent value="all" className="space-y-6 mt-6">
                  {stats.properties.length === 0 ? (
                    <div className="text-center py-12">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-semibold mb-2">
                        No properties listed
                      </p>
                      <p className="text-muted-foreground mb-4">
                        Start by listing your first property
                      </p>
                      <Link href="/property/create">
                        <Button className="bg-primary hover:bg-primary/90">
                          <Plus size={18} className="mr-2" />
                          List Property
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <PropertyTableView
                      properties={stats.properties}
                      onDelete={handleDeleteConfirm}
                    />
                  )}
                </TabsContent>

                {/* Available Properties */}
                <TabsContent value="available" className="space-y-6 mt-6">
                  {availableProperties.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No available properties
                      </p>
                    </div>
                  ) : (
                    <PropertyTableView
                      properties={availableProperties}
                      onDelete={handleDeleteConfirm}
                    />
                  )}
                </TabsContent>

                {/* Rented Properties */}
                <TabsContent value="rented" className="space-y-6 mt-6">
                  {rentedProperties.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No rented properties
                      </p>
                    </div>
                  ) : (
                    <PropertyTableView
                      properties={rentedProperties}
                      onDelete={handleDeleteConfirm}
                    />
                  )}
                </TabsContent>

                {/* Pending Properties */}
                <TabsContent value="pending" className="space-y-6 mt-6">
                  {pendingProperties.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No pending properties
                      </p>
                    </div>
                  ) : (
                    <PropertyTableView
                      properties={pendingProperties}
                      onDelete={handleDeleteConfirm}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            isOpen={deleteConfirm.isOpen}
            title="Delete Property"
            description={CONFIRMATION_MESSAGES.DELETE_PROPERTY}
            confirmText={CONFIRMATION_MESSAGES.YES}
            cancelText={CONFIRMATION_MESSAGES.NO}
            isDangerous
            isLoading={isDeleting}
            onConfirm={handleDeleteProperty}
            onCancel={() => setDeleteConfirm({ isOpen: false })}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}

interface PropertyTableViewProps {
  properties: any[];
  onDelete: (propertyId: string) => void;
}

function PropertyTableView({
  properties,
  onDelete,
}: PropertyTableViewProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-semibold">Property</th>
            <th className="text-left py-3 px-4 font-semibold">Type</th>
            <th className="text-left py-3 px-4 font-semibold">Price</th>
            <th className="text-left py-3 px-4 font-semibold">Status</th>
            <th className="text-left py-3 px-4 font-semibold">Listed</th>
            <th className="text-left py-3 px-4 font-semibold">Featured</th>
            <th className="text-right py-3 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property: any) => (
            <tr key={property.id} className="border-b hover:bg-muted/50">
              <td className="py-4 px-4">
                <div>
                  <p className="font-semibold text-sm">{property.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {property.locality}, {property.city}
                  </p>
                </div>
              </td>
              <td className="py-4 px-4">
                <Badge variant="outline" className="capitalize">
                  {property.type}
                </Badge>
              </td>
              <td className="py-4 px-4">
                <p className="font-semibold">
                  ₹{(property.price / 1000000).toFixed(1)}Cr
                </p>
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
                <p className="text-sm text-muted-foreground">
                  {new Date(property.createdAt).toLocaleDateString()}
                </p>
              </td>
              <td className="py-4 px-4">
                {property.isFeatured ? (
                  <Badge className="bg-primary text-white">Featured</Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
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
                    <DropdownMenuItem asChild>
                      <Link href={`/property/${property.id}/edit`}>
                        <Edit size={16} className="mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(property.id)}
                      className="text-destructive"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
