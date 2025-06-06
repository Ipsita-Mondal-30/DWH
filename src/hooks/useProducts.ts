'use client';

import { useQuery } from '@tanstack/react-query';

// Product interface
interface Product {
  _id: string;
  name: string;
  description: string;
  type: string;
  image?: string;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

// Product name interface for dropdown
interface ProductName {
  id: string;
  name: string;
  type: string;
}

// API function to fetch products
const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch('/api/product', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

// Custom hook using TanStack Query
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook with custom options
interface UseProductsOptions {
  staleTime?: number;
  gcTime?: number;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  onSuccess?: (data: Product[]) => void;
  onError?: (error: Error) => void;
  select?: (data: Product[]) => Product;
}

export const useProductsWithOptions = (options: UseProductsOptions = {}) => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: options.staleTime || 5 * 60 * 1000,
    gcTime: options.gcTime || 10 * 60 * 1000,
    enabled: options.enabled !== false,
    refetchOnWindowFocus: options.refetchOnWindowFocus || false,
    select: options.select,
  });
};

// Hook to get only product names for dropdown
export const useProductNames = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    select: (data: Product[]): ProductName[] => {
      if (!Array.isArray(data)) return [];
      return data.map(product => ({
        id: product._id,
        name: product.name,
        type: product.type || 'none'
      }));
    },
  });
};
