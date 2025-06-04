'use client';

import { useQuery } from '@tanstack/react-query';

// Pricing interface
export interface Pricing {
  quantity: number;
  unit: 'gm' | 'kg' | 'piece' | 'dozen';
  price: number;
}

// Product interface with updated pricing structure
export interface Product {
  _id: string;
  name: string;
  description: string;
  type: string;
  image?: string;
  pricing: Pricing[];
  createdAt?: string;
  updatedAt?: string;
}

// Product name interface for dropdown with pricing info
export interface ProductName {
  id: string;
  name: string;
  type: string;
  pricing: Pricing[];
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
  select?: (data: Product[]) => any;
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

// Hook to get only product names for dropdown with pricing info
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
        type: product.type || 'none',
        pricing: product.pricing
      }));
    },
  });
};

// Hook to get products with formatted display names (including pricing)
export const useProductsWithDisplayNames = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    select: (data: Product[]): Array<{id: string; name: string; displayName: string; pricing: Pricing[]}> => {
      if (!Array.isArray(data)) return [];
      
      const result: Array<{id: string; name: string; displayName: string; pricing: Pricing[]}> = [];
      
      data.forEach(product => {
        // For products with multiple pricing options, create separate entries
        if (product.pricing && product.pricing.length > 0) {
          product.pricing.forEach((pricing, index) => {
            const displayName = `${product.name} (${pricing.quantity} ${pricing.unit} - ₹${pricing.price})`;
            result.push({
              id: `${product._id}_${index}`,
              name: product.name,
              displayName,
              pricing: [pricing]
            });
          });
        } else {
          // Fallback for products without pricing
          result.push({
            id: product._id,
            name: product.name,
            displayName: product.name,
            pricing: []
          });
        }
      });
      
      return result;
    },
  });
};

// Utility function to format pricing display
export const formatPricingDisplay = (pricing: Pricing[]): string => {
  if (!pricing || pricing.length === 0) return 'Price not set';
  
  if (pricing.length === 1) {
    const p = pricing[0];
    return `${p.quantity} ${p.unit} - ₹${p.price}`;
  }
  
  return `${pricing.length} options available`;
};

// Utility function to get cheapest pricing option
export const getCheapestPrice = (pricing: Pricing[]): Pricing | null => {
  if (!pricing || pricing.length === 0) return null;
  
  return pricing.reduce((cheapest, current) => {
    const currentPricePerUnit = current.price / current.quantity;
    const cheapestPricePerUnit = cheapest.price / cheapest.quantity;
    
    return currentPricePerUnit < cheapestPricePerUnit ? current : cheapest;
  });
};