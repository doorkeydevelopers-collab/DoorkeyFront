'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { KEY_ICON } from '@/app/login/icons';
import { Menu, LogOut, LayoutDashboard, Plus, Search } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

export function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const userInitials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  const navLinks = [
    { label: 'Search', href: '/properties', icon: Search },
    ...(isAuthenticated && user?.role === 'owner'
      ? [{ label: 'List Property', href: '/property/create', icon: Plus }]
      : []),
    ...(isAuthenticated && (user?.role === 'owner' || user?.role === 'admin')
      ? [{ label: 'Dashboard', href: `/${user.role}-dashboard`, icon: LayoutDashboard }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white">
              {KEY_ICON}
            </div>
            <span className="hidden sm:inline">DoorKey</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Button
                  key={link.href}
                  variant="ghost"
                  onClick={() => handleNavigate(link.href)}
                  className="gap-2"
                >
                  <Icon size={18} />
                  {link.label}
                </Button>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                {/* Desktop User Menu */}
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-white text-sm">
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col">
                          <span className="font-semibold">{user.fullName}</span>
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleNavigate('/profile')}
                      >
                        Profile Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleNavigate('/bookmarks')}
                      >
                        Bookmarked Properties
                      </DropdownMenuItem>
                      {user.role === 'owner' && (
                        <DropdownMenuItem
                          onClick={() => handleNavigate('/owner-dashboard')}
                        >
                          <LayoutDashboard size={16} className="mr-2" />
                          My Properties
                        </DropdownMenuItem>
                      )}
                      {user.role === 'admin' && (
                        <DropdownMenuItem
                          onClick={() => handleNavigate('/admin-dashboard')}
                        >
                          <LayoutDashboard size={16} className="mr-2" />
                          Admin Panel
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-destructive focus:text-destructive"
                      >
                        <LogOut size={16} className="mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Menu */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <nav className="flex flex-col gap-4 mt-8">
                      {navLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <Button
                            key={link.href}
                            variant="ghost"
                            onClick={() => {
                              handleNavigate(link.href);
                            }}
                            className="justify-start gap-2 w-full"
                          >
                            <Icon size={18} />
                            {link.label}
                          </Button>
                        );
                      })}
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="justify-start gap-2 w-full text-destructive hover:text-destructive"
                      >
                        <LogOut size={18} />
                        Sign Out
                      </Button>
                    </nav>
                  </SheetContent>
                </Sheet>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => handleNavigate('/login')}
                  className="hidden sm:inline-flex"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => handleNavigate('/signup')}
                  className="bg-primary hover:bg-primary/90"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
