import { useState, useCallback } from 'react';

export interface PostOffice {
  Name: string;
  BranchType: string;
  DeliveryStatus: string;
  Circle: string;
  District: string;
  Division: string;
  Region: string;
  Block: string;
  State: string;
  Country: string;
  Pincode: string;
}

interface PincodeApiResponse {
  Message: string;
  Status: string;
  PostOffice: PostOffice[] | null;
}

export function useAddressLookup() {
  const [postOffices, setPostOffices] = useState<PostOffice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lookup by pincode — returns all post offices for that pin
  const lookupByPincode = useCallback(async (pincode: string) => {
    if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      setPostOffices([]);
      setError(null);
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      const data: PincodeApiResponse[] = await response.json();

      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice) {
        setPostOffices(data[0].PostOffice);
        return data[0].PostOffice;
      } else {
        setPostOffices([]);
        setError(data[0]?.Message || 'No results found for this pincode');
        return null;
      }
    } catch (err) {
      setError('Failed to fetch address data. Please try again.');
      setPostOffices([]);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchByName = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setPostOffices([]);
      setError(null);
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.postalpincode.in/postoffice/${encodeURIComponent(query)}`
      );
      const data: PincodeApiResponse[] = await response.json();

      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice) {
        setPostOffices(data[0].PostOffice);
        return data[0].PostOffice;
      } else {
        setPostOffices([]);
        setError(data[0]?.Message || 'No results found');
        return null;
      }
    } catch (err) {
      setError('Failed to search addresses. Please try again.');
      setPostOffices([]);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setPostOffices([]);
    setError(null);
  }, []);

  return {
    postOffices,
    isLoading,
    error,
    lookupByPincode,
    searchByName,
    clearResults,
  };
}
