import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

interface Pricing {
  quantity: number;
  unit: 'gm' | 'kg' | 'piece' | 'dozen';
  price: number;
  _id?: string;
}

export interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image?: string;
    size?: string;
    type?: string;
    pricing?: Pricing[];
  };
  quantity: number;
  selectedPricing?: Pricing;
}

interface CartApiResponse {
  items: CartItem[];
}

// API functions
const fetchCart = async (): Promise<CartApiResponse> => {
  const response = await fetch('/api/cart');
  
  if (!response.ok) {
    throw new Error(`Failed to fetch cart: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
};

const addToCart = async ({ productId, quantity, selectedPricing }: {
  productId: string;
  quantity: number;
  selectedPricing?: Pricing;
}) => {
  const response = await fetch('/api/cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productId, quantity, selectedPricing }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to add item to cart');
  }
  
  return response.json();
};

const updateCartItem = async ({ productId, quantity }: {
  productId: string;
  quantity: number;
}) => {
  const response = await fetch('/api/cart', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productId, quantity }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update cart item');
  }
  
  return response.json();
};

const removeFromCart = async (productId: string) => {
  const response = await fetch('/api/cart', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productId }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to remove item from cart');
  }
  
  return response.json();
};

// ✅ NEW: Clear cart API function
const clearCart = async () => {
  const response = await fetch('/api/cart/clear', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to clear cart');
  }
  
  return response.json();
};

// Custom hook - updated with clear cart functionality
export const useCart = () => {
  const { status } = useSession();
  const queryClient = useQueryClient();

  // Always enabled except when explicitly unauthenticated
  const shouldFetch = status !== 'unauthenticated';

  // Fetch cart items
  const {
    data: cartData,
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
    enabled: shouldFetch,
    retry: 2,
    refetchOnMount: true,
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Update cart item mutation
  const updateCartMutation = useMutation({
    mutationFn: updateCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: removeFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // ✅ NEW: Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      // Immediately update the cache to show empty cart
      queryClient.setQueryData(['cart'], { items: [] });
      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Calculate totals with updated shipping logic
  const calculateTotals = () => {
    const items = cartData?.items || [];
    
    if (items.length === 0) {
      return { subtotal: 0, shippingCost: 59, tax: 0, totalAmount: 59 };
    }
    
    const subtotal = items.reduce((total: number, item: CartItem) => {
      // Use selectedPricing price if available, otherwise fallback to product price
      const itemPrice = item.selectedPricing?.price || item.product.price || 0;
      return total + (itemPrice * item.quantity);
    }, 0);
    
    // Updated shipping logic to match your checkout components
    const shippingCost = subtotal >= 1000 ? 0 : 59;
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const totalAmount = subtotal + shippingCost + tax;
    
    return { subtotal, shippingCost, tax, totalAmount };
  };

  return {
    // Data
    cartItems: cartData?.items || [],
    totals: calculateTotals(),
    
    // States
    isLoading: isLoading || isFetching,
    error,
    
    // Actions
    addToCart: addToCartMutation.mutate,
    updateCart: updateCartMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    clearCart: clearCartMutation.mutate, // ✅ NEW: Clear cart action
    refetch,
    
    // Mutation states
    isAddingToCart: addToCartMutation.isPending,
    isUpdatingCart: updateCartMutation.isPending,
    isRemovingFromCart: removeFromCartMutation.isPending,
    isClearingCart: clearCartMutation.isPending, // ✅ NEW: Clear cart loading state
    
    // Additional utility
    totalItems: cartData?.items?.reduce((total: number, item: CartItem) => total + item.quantity, 0) || 0,
  };
};