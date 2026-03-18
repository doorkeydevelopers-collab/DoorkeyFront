'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useAddressLookup, PostOffice } from '@/hooks/useAddressLookup';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, MapPin, X } from 'lucide-react';

interface AddressSearchProps {
  onSelect: (data: {
    locality: string;
    city: string;
    state: string;
    zipCode: string;
  }) => void;
  disabled?: boolean;
}

export function AddressSearch({ onSelect, disabled }: AddressSearchProps) {
  const [searchMode, setSearchMode] = useState<'pincode' | 'name'>('pincode');
  const [searchInput, setSearchInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSearch = useDebounce(searchInput, 400);
  const { postOffices, isLoading, error, lookupByPincode, searchByName, clearResults } =
    useAddressLookup();
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-search when debounced value changes
  useEffect(() => {
    if (!debouncedSearch) {
      clearResults();
      return;
    }

    if (searchMode === 'pincode') {
      if (/^\d{6}$/.test(debouncedSearch)) {
        lookupByPincode(debouncedSearch).then((results) => {
          if (results && results.length > 0) setIsOpen(true);
        });
      }
    } else {
      if (debouncedSearch.length >= 3) {
        searchByName(debouncedSearch).then((results) => {
          if (results && results.length > 0) setIsOpen(true);
        });
      }
    }
  }, [debouncedSearch, searchMode, lookupByPincode, searchByName, clearResults]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (po: PostOffice) => {
    onSelect({
      locality: po.Name,
      city: po.District,
      state: po.State,
      zipCode: po.Pincode,
    });
    setSearchInput('');
    setIsOpen(false);
    clearResults();
  };

  return (
    <div ref={containerRef} className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Label className="text-base font-semibold flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Quick Address Lookup
        </Label>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={searchMode === 'pincode' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setSearchMode('pincode');
            setSearchInput('');
            clearResults();
          }}
          disabled={disabled}
        >
          By Pincode
        </Button>
        <Button
          type="button"
          variant={searchMode === 'name' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setSearchMode('name');
            setSearchInput('');
            clearResults();
          }}
          disabled={disabled}
        >
          By Place Name
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={
            searchMode === 'pincode'
              ? 'Enter 6-digit pincode (e.g., 400050)'
              : 'Search by post office name (min 3 chars)'
          }
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            if (!e.target.value) setIsOpen(false);
          }}
          onFocus={() => {
            if (postOffices.length > 0) setIsOpen(true);
          }}
          className="pl-9 pr-9"
          disabled={disabled}
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => {
              setSearchInput('');
              setIsOpen(false);
              clearResults();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
          <Spinner size={14} />
          Searching...
        </div>
      )}

      {/* Error message */}
      {error && !isLoading && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Results Dropdown */}
      {isOpen && postOffices.length > 0 && (
        <div className="border rounded-lg bg-background shadow-lg max-h-60 overflow-y-auto divide-y">
          {postOffices.map((po, index) => (
            <button
              key={`${po.Pincode}-${po.Name}-${index}`}
              type="button"
              onClick={() => handleSelect(po)}
              className="w-full text-left px-4 py-3 hover:bg-accent transition-colors"
            >
              <div className="font-medium text-sm">{po.Name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {po.District}, {po.State} — {po.Pincode}
              </div>
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {searchMode === 'pincode'
          ? 'Enter a pincode to auto-fill city, state and locality'
          : 'Search for a post office to auto-fill address details'}
      </p>
    </div>
  );
}
