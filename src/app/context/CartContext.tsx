'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

interface Pricing {
  quantity: number;
  unit: 'gm' | 'kg' | 'piece' | 'dozen';
  price: number;
  _id?: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  size?: string;
  type?: string;
  pricing?: Pricing[]; // For namkeens with multiple pricing options
  selectedPricing?: Pricing; // Currently selected pricing option
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedPricing?: Pricing; // Track which pricing option was selected
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (productId: string, quantity: number, selectedPricing?: Pricing) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    if (status === 'loading') return;
    if (!session) {
      setCart([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching cart...'); // Debug log
      const res = await axios.get('/api/cart');
      console.log('Cart API response:', res.data); // Debug log
      setCart(res.data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to fetch cart');
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId: string, quantity: number, selectedPricing?: Pricing) => {
    if (!session) {
      setError('Please login to add items to cart');
      throw new Error('Authentication required');
    }

    try {
      setError(null);
      console.log('Adding to cart - Context:', { productId, quantity, selectedPricing }); // Debug log
      
      // Prepare the request payload with pricing information
      const payload: any = { productId, quantity };
      
      // If pricing information is provided, include it
      if (selectedPricing) {
        payload.selectedPricing = selectedPricing;
      }

      console.log('Cart payload:', payload); // Debug log
      const response = await axios.post('/api/cart', payload);
      console.log('Cart API response:', response.data); // Debug log
      
      // Only refresh cart after successful addition
      await fetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('Failed to add item to cart');
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!session) {
      setError('Please login to modify cart');
      return;
    }

    try {
      setError(null);
      await axios.delete('/api/cart', { data: { productId } });
      await fetchCart(); // Refresh cart after removing
    } catch (error) {
      console.error('Error removing from cart:', error);
      setError('Failed to remove item from cart');
      throw error;
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!session) {
      setError('Please login to modify cart');
      return;
    }

    try {
      setError(null);
      await axios.put('/api/cart', { productId, quantity });
      await fetchCart(); // Refresh cart after updating
    } catch (error) {
      console.error('Error updating cart:', error);
      setError('Failed to update cart');
      throw error;
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      loading, 
      error 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};